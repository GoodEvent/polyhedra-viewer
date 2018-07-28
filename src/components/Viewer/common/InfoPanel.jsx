// @flow strict
import React, { Fragment } from 'react';
import { css, StyleSheet } from 'aphrodite/no-important';
import _ from 'lodash';

import { polygonNames } from 'constants/polygons';
import { fonts } from 'styles';
import {
  unescapeName,
  getType,
  toConwayNotation,
  getAlternateNames,
} from 'polyhedra/names';
import { getSymmetry, getSymmetryName, getOrder } from 'polyhedra/symmetry';

import connect from 'components/connect';
import { WithPolyhedron } from 'components/Viewer/context';

const styles = StyleSheet.create({
  infoPanel: {
    width: 400, // FIXME don't hardcode
    margin: 10,
    borderSpacing: 8,
    borderCollapse: 'separate',
    padding: 10,
    fontFamily: fonts.times,
  },

  solidName: {
    fontSize: 22,
    marginBottom: 5,
  },

  solidType: {
    fontSize: 18,
    color: 'DimGrey',
    marginBottom: 20,
  },

  dataList: {
    display: 'grid',
    gridTemplateAreas: `
      "verts verts edges edges faces faces"
      "vconf vconf vconf ftype ftype ftype"
      "vol   vol   sa    sa    spher spher"
      "sym   sym   sym   sym   order order"
      "alt   alt   alt   alt   alt   alt"
    `,
    gridRowGap: 15,
  },

  property: {
    marginBottom: 10,
  },

  propName: {
    fontSize: 18,
    marginBottom: 5,
  },

  propValue: {
    fontFamily: fonts.andaleMono,
    color: 'DimGrey',
  },

  sub: {
    verticalAlign: 'sub',
    fontSize: 'smaller',
  },

  sup: {
    verticalAlign: 'super',
    fontSize: 'smaller',
  },
});

// FIXME use unicode or mathml instead
function Sub({ children }) {
  return <sub className={css(styles.sub)}>{children}</sub>;
}

function Sup({ children }) {
  return <sup className={css(styles.sup)}>{children}</sup>;
}

interface InfoRow {
  name: string;
  area: string;
  render: *;
}

function groupedVertexConfig(config) {
  const array = config.split('.');
  const result = [];
  let current = { type: -1, count: 0 };
  _.each(array, type => {
    if (type === current.type) {
      current.count++;
    } else {
      if (current.count) result.push(current);
      current = { type, count: 1 };
    }
  });
  if (current.count) result.push(current);

  return result;
}

function getShortVertexConfig(config) {
  const grouped = groupedVertexConfig(config);
  const children = _.map(grouped, (typeCount, i) => {
    const { type, count } = typeCount;
    const val =
      count === 1 ? (
        type
      ) : (
        <Fragment>
          {type}
          <Sup>{count}</Sup>
        </Fragment>
      );
    if (i === 0) return val;
    return <Fragment>.{val}</Fragment>;
  });
  return <Fragment>{children}</Fragment>;
}

function displayVertexConfig({ polyhedron }) {
  const vConfig = polyhedron.vertexConfiguration();
  const configKeys = _.keys(vConfig);
  // When there's only one type, just get it on its own
  if (configKeys.length === 1) return configKeys[0];
  // TODO possibly square notation but that's hard
  return (
    <ul>
      {_.map(vConfig, (count, type: string) => (
        <li>
          {count}({getShortVertexConfig(type)})
        </li>
      ))}
    </ul>
  );
}

function displayFaceTypes({ polyhedron }) {
  const faceCounts = polyhedron.numFacesBySides();
  // FIXME order by type of face
  return (
    <ul>
      {_.map(faceCounts, (count, type: string) => (
        <li>
          {count} {polygonNames[type]}
          {count !== 1 ? 's' : ''}
        </li>
      ))}
    </ul>
  );
}

function displaySymmetry({ polyhedron, name }) {
  const symmetry = getSymmetry(name);
  const symName = getSymmetryName(symmetry);
  const { group = '', sub } = symmetry;
  return (
    <Fragment>
      {_.capitalize(symName)}, {group}
      {sub ? <Sub>{sub}</Sub> : undefined}
    </Fragment>
  );
}

const info: InfoRow[] = [
  {
    name: 'Vertices',
    area: 'verts',
    render: ({ polyhedron }) => polyhedron.numVertices(),
  },
  {
    name: 'Edges',
    area: 'edges',
    render: ({ polyhedron }) => polyhedron.numEdges(),
  },
  {
    name: 'Faces',
    area: 'faces',
    render: ({ polyhedron }) => polyhedron.numFaces(),
  },
  {
    name: 'Vertex configuration',
    area: 'vconf',
    render: displayVertexConfig,
  },
  {
    name: 'Faces by type',
    area: 'ftype',
    render: displayFaceTypes,
  },

  {
    name: 'Volume',
    area: 'vol',
    render: ({ polyhedron: p }) => (
      <Fragment>
        ≈{_.round(p.volume() / Math.pow(p.edgeLength(), 3), 3)}s<Sup>3</Sup>
      </Fragment>
    ),
  },
  {
    name: 'Surface area',
    area: 'sa',
    render: ({ polyhedron: p }) => (
      <Fragment>
        ≈{_.round(p.surfaceArea() / Math.pow(p.edgeLength(), 2), 3)}s<Sup>
          2
        </Sup>
      </Fragment>
    ),
  },
  {
    name: 'Sphericity',
    area: 'spher',
    render: ({ polyhedron: p }) => `≈${_.round(p.sphericity(), 3)}`,
  },

  { name: 'Symmetry', area: 'sym', render: displaySymmetry },
  { name: 'Order', area: 'order', render: ({ name }) => getOrder(name) },

  {
    name: 'Also known as',
    area: 'alt',
    render: ({ name }) => {
      const alts = getAlternateNames(name);
      if (alts.length === 0) return '--';
      return <ul>{alts.map(alt => <li key={alt}>{alt}</li>)}</ul>;
    },
  },
];

function InfoPanel({ solidName, polyhedron }) {
  return (
    <div className={css(styles.infoPanel)}>
      <h2 className={css(styles.solidName)}>
        {_.capitalize(unescapeName(solidName))}, {toConwayNotation(solidName)}
      </h2>
      <div className={css(styles.solidType)}>{getType(solidName)}</div>
      <dl className={css(styles.dataList)}>
        {info.map(({ name, area, render: Renderer }) => {
          return (
            <div className={css(styles.property)} style={{ gridArea: area }}>
              <dd className={css(styles.propName)}>{name}</dd>
              <dt className={css(styles.propValue)}>
                <Renderer name={solidName} polyhedron={polyhedron} />
              </dt>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export default connect(
  WithPolyhedron,
  ['solidName', 'polyhedron'],
)(InfoPanel);
