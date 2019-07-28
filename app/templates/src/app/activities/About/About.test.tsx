import { assert } from 'chai';
import { shallow } from 'enzyme';
import * as React from 'react';
import About from './About';

describe('About activity', () => {
  it('Should render correctly', () => {
    const component = shallow((
      <About />
    ));

    assert.equal(component.find('h3').text(), 'About me');
    assert.equal(component.find('p').text(), 'What about me?');
  });
});
