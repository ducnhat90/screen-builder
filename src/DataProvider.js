/* istanbul ignore file */
import axios from 'axios';
import _ from 'lodash';

export default {
  screensCache: [],

  install(Vue) {
    Vue.prototype.$dataProvider = this;
  },
  apiInstance() {
    // Use the real apiClient
    if (_.has(window, 'ProcessMaker.apiClient') && !window.ProcessMaker.isStub) {
      return window.ProcessMaker.apiClient;
    }

    // Allow standalone app to use a real api if token and baseURL are present
    if (this.token()) {
      axios.defaults.baseURL = this.baseURL();
      axios.defaults.headers.common = {
        'Authorization': 'Bearer ' + this.token(),
      };
      return axios;
    }

    // If the apiClient is a stub, use it for running tests
    if (_.has(window, 'ProcessMaker.apiClient') && window.ProcessMaker.isStub) {
      return window.ProcessMaker.apiClient;
    }

    // For anything else, use a dummy api client
    return {
      get() {
        return Promise.resolve({
          data: {
            data: [],
          },
        });
      },
    };
  },
  get(...args) {
    return this.apiInstance().get(...args);
  },
  post(...args) {
    return this.apiInstance().post(...args);
  },
  token() {
    return localStorage.getItem('token');
  },
  baseURL() {
    return localStorage.getItem('baseURL');
  },
  
  // Methods below are used in the components
  
  getTasks(params) {
    const endpoint = _.get(window, 'PM4ConfigOverrides.getTasksEndpoint', '/tasks');
    return this.get(endpoint + params).then(response => {
      if (response.data.screen && response.data.screen.nested) {
        this.addNestedScreenCache(response.data.screen.nested);
      }
      return response;
    });
  },
  addNestedScreenCache(nested) {
    nested.forEach(screen => {
      const index = this.screensCache.findIndex(s => s.id == screen.id);
      if (index > -1) {
        this.screensCache.splice(index, 1, screen);
      } else {
        this.screensCache.push(screen);
      }
    });
  },
  getScreen(id, query = '') {
    const endpoint = _.get(window, 'PM4ConfigOverrides.getScreenEndpoint', '/screens');
    return new Promise((resolve, reject) => {
      const cache = this.screensCache.find(screen => screen.id == id);
      if (cache) {
        resolve({data: cache});
      } else {
        const request = this.get(endpoint + `/${id}${query}`);
        request.then(response => {
          if (response.data.nested) {
            this.addNestedScreenCache(response.data.nested);
          }
          resolve(response);
        }).catch(response => reject(response));
      }
    });
  },
  
  postScript(id, params) {
    let endpoint = _.get(
      window,
      'PM4ConfigOverrides.postScriptEndpoint',
      '/scripts/execute/{id}'
    );

    const authParams = _.get(
      window,
      'PM4ConfigOverrides.authParams',
      null
    );

    let query = '';
    if (authParams) {
      query = '?' + (new URLSearchParams(authParams)).toString();
    }

    return this.post(
      endpoint.replace('{id}', id) + query,
      params
    );
  },
};