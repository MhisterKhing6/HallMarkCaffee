
const postToBackend = async (apiEndpoint, data, token="") => {
    /** 
     * postToBackend: uses fetch to post data to backedn
     */
    let baseUrl = 'http://localhost:8000'
    let url = baseUrl + apiEndpoint
  // Default options are marked with *
  try {
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return {data: await response.json(), status: response.status} ;
  }catch (err) {
      console.log(err)
      return {data: {"reason": "Network Error check ur internet"}, status: "errr"}    
    } // parses JSON response into native JavaScript objects
    
}

const putToBackend = async (apiEndpoint, data, token="") => {
    /** 
     * postToBackend: uses fetch to post data to backedn
     */
    let baseUrl = 'http://localhost:8000'
    let url = baseUrl + apiEndpoint
  // Default options are marked with *
  try {
    const response = await fetch(url, {
        method: "PUT", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
        // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return {data: await response.json(), status: response.status} ;
  }catch (err) {
      console.log(err)
      return {data: {"reason": "Network Error check ur internet"}, status: "errr"}    
    } // parses JSON response into native JavaScript objects
    
}

const getFromBackend = async (apiEndpoint, token="") => {
  /** 
   * postToBackend: uses fetch to post data to backedn
   */
  let baseUrl = 'http://localhost:8000'

  let url = baseUrl  + apiEndpoint
// Default options are marked with *
try {
  const response = await fetch(url, {
    headers: {
      "Authorization": "Bearer " + token
    }
  });
  return {data: await response.json(), status: response.status}
}
catch(err) {
  console.log(err)
  return {data: {"reason": "Network Error check ur internet"}, status: "errr"}
}
   ; // parses JSON response into native JavaScript objects
  
}

const deleteFromBackend = async (apiEndpoint, token="") => {
    /** 
     * postToBackend: uses fetch to post data to backedn
     */
    let baseUrl = 'http://localhost:8000'
  
    let url = baseUrl  + apiEndpoint
  // Default options are marked with *
  try {
    const response = await fetch(url, {method:"DELETE",
      headers: {
        "Authorization": "Bearer " + token
      }
    });
    return {data: await response.json(), status: response.status}
  }
  catch(err) {
    console.log(err)
    return {data: {"reason": "Network Error check ur internet"}, status: "errr"}
  }
     ; // parses JSON response into native JavaScript objects
    
  }

//get all users that have orders in a week that is not cancelled or delivered
const adminWeeklyOrders =  async (token) => {
    let endpoint = "/admin/weekly/orders"
    return await getFromBackend(endpoint, token)
}

//get all the orders with items for a user in the whole week
const adminGetOrdersOfUserWeek = async (userId,token) => {
    let endpoint = `/admin/order-items${userId}`
    return await getFromBackend(endpoint, token)
}

//get total sales, average sales, total orders, 
//accepted durations day, month, year, lifetime
const statistics = async (duration,token) => {
    let endpoint = `/admin/statistics${duration}`
    return await getFromBackend(endpoint, token)
}

//change the status of order
// orderId, id of the order u want to change
//accepted status are delivered, cancelled, preparing
const updateOrderStatus = async (orderId, status, token) => {
    let endpoint = `/admin/order-status`
    return await postToBackend(endpoint, {orderId:orderId, status:status}, token)
}


//toggle food
//foodId, id of the food u want toggle state
//accepted status enable, disable
const toggleFood = async (foodId, status, token) => {
    let endpoint = `/admin/food/status`
    return await postToBackend(endpoint, {id:foodId, status:status}, token)
}

//delete food
//foodId, id of the food u want to delete
const deleteFood = async (foodId, token) => {
    let endpoint = `/admin/food/${foodId}`
    return await deleteFromBackend(endpoint, token)
}

//get all foods in the database

const viewFoods = async (token) => {
    let endpoint = `/admin/food`
    return await getFromBackend(endpoint, token)
}

//update food entry
/*
example of data {
    "id":"xxx",
    "foodParameter": "new value"
} 
   accepted foodParameters name, size, url(base64), fileName,categoryId, description, price  
*/
const updateFoodEntry = async (data, token) => {
    let endpoint = '/admin/food'
    return await putToBackend(endpoint, data, token)
}

//get users with their last orders
const getUsers = async (token) => {
    let endpoint = '/admin/users'
    return await getFromBackend(endpoint,token)
}

const searchOrder = async (searchPattern, token) => {
    let endpoint = '/admin/search/order'
    return await postToBackend(endpoint, {pattern:searchPattern}, token)
}

/*
// use cases
let tokens = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Inh4eEBnYW1pbC5jb20iLCJpZCI6IjY2OWUyNTU0YjViZDNiYjA4Y2I4YTg1YyIsImlhdCI6MTcyMTc2ODA5NSwiZXhwIjoxNzIyNjMyMDk1fQ.8XtK0LGWd93U2v_hKAGtcmMjfeWjoFVln7H64S2_Qjc";
//for testing sake, delete am otherwise it will run each time u import, 
(async () => {
    let response = await getUsers(tokens)
    console.log(response)
})()
 */
//export the rest of the functions in need

export { getFromBackend, postToBackend, searchOrder, getUsers, viewFoods, deleteFood };
