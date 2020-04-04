const Response = require('./Response');

class AxiosResponse extends Response {
  body() {
    return this.res.data;
  }

  hasNoBody() {
    const hasNoContentTypeHeader = this.res.hasOwnProperty('headers')
      && !this.res.headers.hasOwnProperty('content-type');
    const bodyHasNoContent = (this.res.data === '');
    return (hasNoContentTypeHeader && bodyHasNoContent);
  }

  getBodyForValidation() {
    if (this.hasNoBody()) {
      return null;
    }

    const body = this.body();
    return body;
  }

  req() {
    return this.res.request;
  }

  summary() {
    const summary = {
      status: this.status(),
      body: this.body(),
    };

    return summary;
  }
}

module.exports = AxiosResponse;
