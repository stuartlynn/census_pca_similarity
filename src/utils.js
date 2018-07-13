export const CartoQuery = (query,username,apiKey, host='carto-staging')=>{
  let url = `http://${encodeURIComponent(username)}.${host}.com/api/v2/sql?q=${encodeURIComponent(query)}&format=json`
  if(apiKey){
    url += `&api_key=${apiKey}`
  }
  return fetch(url).then(res => res.json())
}

export const CheckBatchQuery=(jobID, username,apiKey,host='carto-staging')=>{
  let url = `http://${encodeURIComponent(username)}.${host}.com/api/v2/sql/job/${jobID}`
  if(apiKey){
    url += `?api_key=${apiKey}`
  }
  return fetch(url).then((r)=>r.json())
}
export const uniqueKeys = (data)=>{
  let keys = new Set()
  data.forEach((d)=>{
    if (d) Object.keys(d).forEach((v) => keys.add(v))
  })
  return Array.from(keys)
}

export const CartoCheckIfTableExists = (tableName,username,apiKey)=>{
  return CartoQuery(`select * from ${tableName} limit 1`,username,apiKey).then(res=>{
    return res.hasOwnProperty('rows')
  })
}
export const CartoDeleteTableContents = async(tableName,username,apiKey)=>{
  return CartoQuery(`delete * from ${tableName}`, username,apiKey)
}

export const CartoCreateTable = async (tableName, columns, types, username, apiKey)=>{
  const columnList = types.map((column) => column.join(' '))
  const query = ` CREATE TABLE ${tableName} ( ${columnList.join(',')} )`
  return await CartoQuery(query,username,apiKey)
}
export const CartoPopulateTableWithDataInChunks = (data, tablename, username,apiKey,chunksize=10)=>{
  const chunks = data.reduce( (chunk,row,index) => {
    const chunkNo = Math.floor(index/chunksize)
    chunk[chunkNo] = chunk[chunkNo] ? chunk[chunkNo] : []
    const rowInsert = `(${Object.values(row).join(',')})`
    chunk[chunkNo].push(rowInsert)
    return chunk
   }, [])

  const types =  javascriptToSQLTypes(data[0]);

  const chunkInsertQuery = chunks.map(chunk =>

    `INSERT INTO ${tablename} (${types.map(t=>t[0]).join(',')})
     VALUES ${chunk.join(',')}`
  )
  return  Promise.all( chunkInsertQuery.map(query => CartoQuery(query, username, apiKey)))
}

export const javascriptToSQLTypes = (exampleRow)=>{
  const typesMapping = {
    "string" : 'text',
    "number" : 'numeric'
  }

  const sqlTypes  = Object.keys(exampleRow).map( (k)=>[k, typesMapping[typeof(exampleRow[k])]])
  return sqlTypes
}

export const CartoImport = async (data, tableName,username,apiKey, append=false, host='carto-staging',)=>{
  const tableExists = await CartoCheckIfTableExists(tableName,username,apiKey)

  if(tableExists && !append){
    await CartoDeleteTableContents(tableName,username,apiKey)
  }
  else if( !tableExists ){
    const keys = uniqueKeys(data)
    const types = javascriptToSQLTypes(data[0])
    await CartoCreateTable(tableName, keys, types,username,apiKey)
  }
  await CartoPopulateTableWithDataInChunks(data, tableName,username,apiKey)
}

export const BatchQuery = ( query,username,apiKey,host='carto-staging')=>{
  let url = `http://${encodeURIComponent(username)}.${host}.com/api/v2/sql/job`
  if(apiKey){
    url += `?api_key=${apiKey}`
  }
  var data = new FormData();
  data.append( "query", JSON.stringify( query ) );
  return fetch(url,{
    method: 'post',
    body: data,
    headers:{
      'Accept': 'application/json'
    }
  }).then((res)=>res.json())
    .then((res)=>{
      const jobID = res.job_id;
      let checkDone  = new Promise ( (accept,reject)=>{
        const checkQueryStatus = ()=>{
            CheckBatchQuery(jobID,username,apiKey).then((r)=>{
              if(r.status=='done'){
                accept(r)
              }
              else if (r.status=='running' || r.status=='pending'){
                setTimeout( checkQueryStatus.bind(this), 2000)
              }
              else{
                reject()
              }
            })
        }
        checkQueryStatus()
      })
      return checkDone
    })
}

export const queryForMeasure = (measureDetails)=>{
  const {numer_id, geom_id, numer_tablename, geom_tablename, geom_colname, numer_colname, geom_geomref_colname} = measureDetails
  return `select ${geom_tablename}.${geom_geomref_colname},
                 ${geom_tablename}.the_geom,
                 ${geom_tablename}.the_geom_webmercator,
                 ${numer_colname} as val
          from ${numer_tablename}, ${geom_tablename}
          where ${numer_tablename}.${geom_geomref_colname} = ${geom_tablename}.${geom_geomref_colname}
          `
}

export const getScatterPlotData = (table,xCol, yCol, username,apiKey)=>{
  const query = ` select ${xCol} as x, ${yCol} as y, cartodb_id from ${table}`
  return CartoQuery( query, username,apiKey).then(res=>res.rows)
}

export const binsForColumn = (query,column,username,apiKey)=>{
    const queryString = `select CDB_QUANTILEBINS(array_agg(${column}::NUMERIC),7) as quants from (${query}) as a limit 1`
    return CartoQuery(queryString,username,apiKey).then((result)=>{
        return result.rows[0].quants
    })
}

export const geometryTypeForTable = (query,username,apiKey)=>{
    const queryString = `select ST_GeometryType(the_geom) as geom_type from (${query}) as a limit 1`
    return CartoQuery(queryString,username,apiKey).then((result)=>{
        return result.rows[0].geom_type
    })
}

export const columnsForQuery = (query,username,apiKey, includeGeom=false, includeID=false)=>{
  const limitQuery = `select * from (${query}) as a limit 1`

  return CartoQuery(limitQuery, username, apiKey).then((res)=> res.fields).then((fields)=>{
    if(!includeGeom){
      delete fields.the_geom
      delete fields.the_geom_webmercator
    }
    if(!includeID){
      delete fields.cartodb_id
    }
    return fields
  })
}

export const getTargetColumnDetails = (query,column,username,apiKey)=>{
  return binsForColumn(query,column,username,apiKey)
}

export const StatsForFields = (query,fields, username, apiKey)=>{
  const min_max = Object.keys(fields).filter(f=>fields[f]=='number').map((field)=>{
    if(fields.field=='number'){
      return `min(${field}) as ${field}_min, max(${field}) as ${field}_max`
    }
  })
  const stats_query = ` select ${min_max.join(',')} from  (${query}) as q `
  return CartoQuery(stats_query, username, apiKey).then((r)=>{
    return r.rows
  })
}

export const extentForQuery = (query,username,apiKey)=>{
  const queryString  = `select ST_EXTENT(the_geom) from (${query}) a `
  return CartoQuery(queryString, username,apiKey).then((res)=>{
    const extent = res.rows[0].st_extent
    let parser  = /([\d-\.]+) ([\d-\.]+),([\d-\.]+) ([\d-\.]+)/;
    return extent.match(parser).map(a => parseFloat(a)).slice(1,5)
  })
}

export const styleForColumn = (column,bins,layerType='circle',colorScheme=null, opacity=1.0)=>{
  if(!colorScheme){
    colorScheme = [ '#f3e79b','#fac484','#f8a07e','#eb7f86','#ce6693','#a059a0','#5c53a5' ]
  }
  let colorArg= []

  if (colorScheme.length !== bins.length){
    throw(`Color array ${colorScheme.length} and bin array ${bins.length} should be same size.`)
  }
  bins.forEach((b,i)=>{
    //HACK JUST NOW FOR ISSUE WITH SAME BIN EDGES
    if(b === bins[i-1]){
      b+= i*0.00001
    }
    colorArg.push(b)
    colorArg.push(colorScheme[i])
  })
  if(layerType==='circle'){
    return(
      {
        "circle-radius": 5,
        "circle-opacity": opacity,
        "circle-color" : [
          "interpolate",
          ["linear"],
          ['get' , column],
          ...colorArg
        ]
      }
    )
  }else{
    return(
      {
        "fill-opacity": opacity,
        "fill-color" : [
          "interpolate",
          ["linear"],
          ['get' , column],
          ...colorArg
        ]
      }
    )
  }
}
