import * as React from 'react';
import { Confirm } from './input/confirm';

export function FallbackComponent(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <>
      {children ? children : <Confirm onConfirm={() => console.log('test')} />}
    </>
  );
}
