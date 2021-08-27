import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';

const App = () => <p>This is my app</p>;

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return <p>Error!</p>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
