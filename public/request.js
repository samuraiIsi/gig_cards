const readBody = data => {

    let response;

    if (!data.target.responseType || data.target.responseType === 'text') {

        response = data.target.responseText;

    } else if (data.target.responseType === 'document') {

        response = data.target.responseXML;

    } else {

        response = data.target.response;
    }

    return response;
};

const encode = object => {

    let encodedString = '';

    for (let prop in object) {

        if (object.hasOwnProperty(prop)) {

            if (encodedString.length > 0) {

                encodedString += '&';
            }

            encodedString += encodeURI(prop + '=' + object[prop]);
        }
    }

    return encodedString;
}

const request = (options, success, failure) => {

    const xhr = new XMLHttpRequest();

    xhr.open(options.method, options.url, options.async);

    xhr.responseType = options.responseType || '';

    xhr.withCredentials = options.withCredentials;

    Object.keys(options.requestHeader).forEach(key => xhr.setRequestHeader(key, options.requestHeader[key]));

    xhr.send(encode(options.data || ''));

    xhr.onload = data => success(readBody(data));

    xhr.onerror = data => failure(readBody(data));
};

export default request;