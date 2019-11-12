import * as React from "react";
import {Confirm} from "./input/confirm";

export function FallbackComponent(props) {
  const { children } = props;

  return (
    <>
      {children ? children : <Confirm onConfirm={() => console.log("test")} />}
    </>
  );
}
