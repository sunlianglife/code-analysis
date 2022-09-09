/**
 * 状态码
 * 0  unsent XHR被创建，但未调用open方法
 * 1  opened open方法已调用，建立了链接
 * 2  headers_received send方法已调用，并且已经可以获取状态行和响应头
 * 3  loading 响应体下载中
 * 4  done  响应体下载完成，responseText可以使用
 */

let xhr = new XMLHttpRequest()
xhr.onreadystatechange = function(){
    // 通过判断 xhr 的 readyState，确定此次请求是否完成
    if (xhr.readyState === 2){
        console.log("HEADERS_RECEIVED",xhr.readyState);
    } else if (xhr.readyState === 3){
        console.log("LOADING",xhr.readyState);
    } else if (xhr.readyState === 4){
        console.log("DONE",xhr.readyState);
        console.log(xhr.responseText);
    }
}

xhr.open("GET", "https://jsonplaceholder.typicode.com/users");
xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
xhr.send(null);