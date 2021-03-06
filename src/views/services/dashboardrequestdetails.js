import moment from 'moment';

function syntaxHighlight(json) {
  if (!json) return '{}';
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}
export default {
  name: 'dashboardhome',
  data() {
    return {
      apiuser: {},
      requests: [],
      request: {},
    };
  },
  methods: {
    fdt(ct) {
      return moment(ct).format('D MMMM, YYYY. hh:mm a');
    },
    loadRequests() {
      const self = this;
      self.$http.getLite('api/v1/dashboard/apicalls', { id: self.$route.params.id })
        .then((response) => {
          const rd = response.data;
          // console.log(rd);
          if (rd.data) {
            self.request = rd.data.reqlog;
            self.request.req = {};
            self.request.res = {};
            rd.data.logs.forEach((l) => {
              if (l.comment === 'Request') {
                self.request.req = l.data;
                self.request.path = l.data.endpoint;
              }
              if (l.comment === 'Response') {
                self.request.res = l.data;
              }
            });
            const jstr = JSON.stringify(self.request.req.body, null, 2);
            const jstres = JSON.stringify(self.request.res, null, 2);
            document.querySelector('#reqpre').innerHTML = syntaxHighlight(jstr);
            document.querySelector('#respre').innerHTML = syntaxHighlight(jstres);
          }
        })
        .catch((error) => {
          // console.dir(error);
          const error_response = error.response;
          self.$swal('Oops', (error_response && error_response.data && error_response.data.message) || error.message, 'error');
        });
    },
  },
  created() {
    this.apiuser = this.$route.meta.$authData;
    this.loadRequests();
  },
};
