import React, { memo, useCallback, ButtonHTMLAttributes } from 'react';
import { useStyle } from 'styles';
import _ from 'lodash';

import Config from 'components/ConfigCtx';
import {
  configInputs,
  ConfigInput as InputType,
} from 'components/configOptions';
import { hover } from 'styles/common';
import { andaleMono } from 'styles/fonts';

function getInputValue<T>(input: InputType<T>, el: any) {
  switch (input.type) {
    case 'checkbox':
      return el.checked;
    default:
      return el.value;
  }
}

function getInputProps<T>(input: InputType<T>, value: T) {
  switch (input.type) {
    case 'checkbox':
      return { checked: value };
    case 'range':
      return {
        ..._.pick(input, ['min', 'max', 'step']),
        value,
      };
    default:
      return { value };
  }
}

interface InputProps<T> {
  input: InputType<T>;
  value: T;
  setValue(key: string, value: T): void;
}

function ConfigInput({ input, value, setValue }: InputProps<any>) {
  const inputProps = getInputProps(input, value);
  const onChange = useCallback(
    e => setValue(input.key, getInputValue(input, e.target)),
    [input],
  );
  switch (input.type) {
    case 'select':
      return (
        <select onChange={onChange} {...inputProps}>
          {_.map(_.get(input, 'options'), option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    default:
      return <input type={input.type} onChange={onChange} {...inputProps} />;
  }
}

const LabelledInput = memo(({ input, value, setValue }: InputProps<any>) => {
  const css = useStyle({
    width: '100%',
    marginBottom: 16,
    display: 'flex',
    justifyContent: 'space-between',
    fontFamily: andaleMono,
  });
  return (
    <label {...css()}>
      {input.display}
      <ConfigInput input={input} value={value} setValue={setValue} />
    </label>
  );
});

function ResetButton({ onClick }: ButtonHTMLAttributes<Element>) {
  const css = useStyle({
    ...hover,

    width: 120,
    height: 30,
    marginTop: 20,

    border: '1px LightGray solid',

    fontFamily: andaleMono,
    fontSize: 14,
  });
  return (
    <button {...css()} type="button" onClick={onClick}>
      Reset
    </button>
  );
}

export default function ConfigForm() {
  const config = Config.useState();
  const { setValue, reset } = Config.useActions();

  const css = useStyle({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    padding: 20,
  });
  return (
    <form {...css()}>
      {configInputs.map(input => (
        <LabelledInput
          key={input.key}
          input={input}
          value={_.get(config, input.key)}
          setValue={setValue}
        />
      ))}
      <ResetButton onClick={reset} />
    </form>
  );
}
