


import React, { useState, useCallback } from 'react';
import Icon from '@mdi/react';
import { mdiMenuDown } from '@mdi/js';

import { styled, fonts } from 'styles';
import { SrOnly } from 'components/common';
import Markdown from './Markdown';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const Text = styled.div({});

const Toggle = styled.button({
  display: 'flex',
  alignItems: 'center',

  textAlign: 'center',
  backgroundColor: 'transparent',
  margin: 'auto 0',
  fontSize: 14,
  border: 'none',
  color: 'blue',
  fill: 'blue',
  cursor: 'pointer',
  fontFamily: fonts.times,

  ':hover': {
    textDecoration: 'underline',
  },
});

interface Props {
  content: string;
  title: string; // used for a11y
}

export default function Description({ title, content }: Props) {
  const [collapsed, setCollapsed] = useState(true);
  const toggle = useCallback(() => setCollapsed(!collapsed), [collapsed]);

  const brief = content.split('\n\n')[0];

  return (
    <Container>
      <Text>
        <Markdown source={collapsed ? brief : content} />
      </Text>
      {collapsed && (
        <Toggle onClick={toggle}>
          <span>
            <Icon path={mdiMenuDown} size="20px" />
          </span>
          {'More'}
          <SrOnly>{`about ${title}`}</SrOnly>
        </Toggle>
      )}
    </Container>
  );
}
