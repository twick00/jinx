import * as React from 'react';
import { Box, Text } from 'ink';
import { LoadingIcon } from '../loadingIcon';
import * as fs from 'fs';
import { PathLike } from 'fs';
import { Confirm } from '../input/confirm';
import { Exit } from '../exit';
import { noop } from 'lodash';

interface CreateFileProps {
  path: PathLike;
  fileContents: string;
  onResolve: (error: NodeJS.ErrnoException, buffer: Buffer) => void;
  onReject?: (error: NodeJS.ErrnoException) => void;
}

export const CreateFile = (props: CreateFileProps) => {
  const {
    path = '',
    fileContents = null,
    onResolve = noop,
    onReject = noop
  } = props;
  const [message, setMessage] = React.useState(null);

  const writeFile = () => {
    fs.writeFile(path, fileContents, err =>
      err ? onReject(err) : fs.readFile(path, onResolve)
    );
  };

  React.useEffect(() => {
    if (fs.existsSync(props.path)) {
      setMessage(
        <Box>
          <Text>That file already exists. Do you want to overwrite it? </Text>
          <Confirm onConfirm={writeFile} onDeny={exit} />
        </Box>
      );
    } else {
      setMessage(
        <Box>
          <Text>Creating file</Text>
          <LoadingIcon color={{ blue: true }} />
        </Box>
      );
      writeFile();
    }
  }, [props.path, writeFile]);

  const exit = () => {
    setMessage(<Exit />);
  };

  return message;
};
