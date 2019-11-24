import * as React from 'react';
import { Box, Color, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface InputProps {
  output: string;
  onResolve: (input: string) => void;
  placeholder?: string;
}

export const UserInput = (props: InputProps) => {
  const [input, setInput] = React.useState('');
  const { output, onResolve } = props;
  useInput((i, key) => {
    if (key.return) {
      onResolve(input.trim());
    }
  });

  return (
    <Box>
      <Color blue>
        {output}
        <TextInput value={input} onChange={setInput} />
      </Color>
    </Box>
  );
};
