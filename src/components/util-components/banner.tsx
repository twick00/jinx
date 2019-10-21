import * as React from "react";
import { Box, Color } from "ink";

export const Banner = () => {
  const color = { grey: true };
  return (
    <Box height={6} flexDirection={"column"}>
      <Box>
        <Color {...color}>{"|__   __|    "}</Color>
        <Color green>By</Color>
        <Color>{"| |"}</Color>
        <Color blue>Tyler</Color>
      </Box>
      <Color {...color}>{"   | | ___   __| | ___  "}</Color>
      <Color {...color}>{"   | |/ _ \\ / _` |/ _ \\ "}</Color>
      <Color {...color}>{"   | | (_) | (_| | (_) |"}</Color>
      <Color {...color}>{"   |_|\\___/ \\__,_|\\___/ "}</Color>
    </Box>
  );
};
