import * as React from "react";
import {Color} from "ink";
import {ellipsis, LoadingIcon} from "./loadingIcon";

export const exitGracefully = (time?: number) => {
  setTimeout(() => process.exit(0), time || 1000);
};

export interface ExitProps {
  time?: number;
}

export const Exit = (props: ExitProps) => {
  const { time } = props;
  React.useEffect(() => {
    exitGracefully();
  });
  return (
      <Color green>
        Exiting
        <LoadingIcon interval={300} values={ellipsis} color={{ green: true }} />
      </Color>
  );
};
