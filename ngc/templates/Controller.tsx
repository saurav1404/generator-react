import * as image from 'assets/emoji.gif';
import * as React from 'react';
import <%= componentName %> from './<%= componentName %>';
import * as styles from './<%= componentName %>.css';

export default function <%= componentName %>Controller() {
  return (
    <<%= componentName %> classNames={styles} image={image as any} />
  );
}
