const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3000;

const SMARTLEAD_API_KEY = process.env.SMARTLEAD_API_KEY;
const FAKE_API_KEY = process.env.FAKE_API_KEY;

// Filter function to restrict proxy to certain paths and GET requests
const filter = (pathname, req) => {
  return req.method === 'GET' && req.query.api_key === FAKE_API_KEY;
};

// Proxy middleware options
const proxyOptions = {
  target: "https://server.smartlead.ai",
  changeOrigin: true,
  pathRewrite: (path, req) => {
    // Remove client API key from the query string
    delete req.query.api_key;
    const queryString = Object.keys(req.query)
      .map(key => `${key}=${encodeURIComponent(req.query[key])}`)
      .join('&');
    // Return the modified path
    return `${path.split('?')[0]}?api_key=${encodeURIComponent(SMARTLEAD_API_KEY)}&${queryString}`;
  },
  onError: (err, req, res) => {
    res.status(500).send('Proxy Error');
  },
};

// Create the proxy middleware
const apiProxy = createProxyMiddleware(filter, proxyOptions);

// Apply the proxy middleware
app.use(apiProxy);

// // Default route for unmatched paths
// app.use('*', (req, res) => {
//   res.status(404).send('Not Found');
// });

app.listen(port, () => {
  console.log(`Proxy server listening on port ${port}`);
});
