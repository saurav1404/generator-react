import { assert } from 'chai';
import { shallow } from 'enzyme';
import * as React from 'react';
import <%= componentName %> from './<%= componentName %>';

describe('<%= componentName %> activity', () => {
  it('Should render correctly', () => {
    const component = shallow((
      <<%= componentName %> classNames={{}} image='no-image.png' />
    ));

    assert.equal(component.find('h3').text(), '<%= componentName %>');
    assert.equal(component.find('p').text(), 'Works.');
  });
});
