import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MSWToolbar } from '../src';

describe('it', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <MSWToolbar apiUrl="http://www.example.com" worker={undefined} />,
      div
    );
    ReactDOM.unmountComponentAtNode(div);
  });
});
