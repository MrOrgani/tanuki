/* eslint-disable @next/next/no-img-element */
import React from 'react';

export default function MockImage(props: React.ComponentPropsWithoutRef<'img'>) {
  return <img alt={props.alt} />;
}
