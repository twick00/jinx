import { Color, Text, TextProps, useInput } from "ink";
import * as React from "react";
import { noop } from "lodash";

interface ConfirmProps {
  onConfirm?: () => void;
  onDeny?: () => void;
  confirmKey?: string;
  denyKey?: string;
  defaultConfirm?: boolean;
  textProps?: TextProps;
}

export const Confirm = (props: ConfirmProps) => {
  const {
    onConfirm = noop,
    onDeny = noop,
    confirmKey = "Y",
    denyKey = "N",
    defaultConfirm = true,
    textProps = {}
  } = props;
  useInput((input, key) => {
    if (
      input.toUpperCase() === confirmKey ||
      (defaultConfirm ? key.return : false)
    ) {
      onConfirm();
    }
    if (
      input.toUpperCase() === denyKey ||
      (!defaultConfirm ? key.return : false)
    ) {
      onDeny();
    }
  });
  const confirmText = (
    <Color green>
      {defaultConfirm ? confirmKey.toUpperCase() : confirmKey.toLowerCase()}
    </Color>
  );
  const denyText = (
    <Color red>
      {defaultConfirm ? denyKey.toLowerCase() : denyKey.toUpperCase()}
    </Color>
  );
  return defaultConfirm ? (
    <Text {...textProps}>
      {confirmText}/{denyText}
    </Text>
  ) : (
    <Text {...textProps}>
      {denyText}/{confirmText}
    </Text>
  );
};
