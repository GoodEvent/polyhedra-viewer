import _ from 'lodash';

import { Point } from 'types';
import {
  PolyhedronCtx,
  OperationCtx,
  TransitionCtx,
  useApplyOperation,
} from '../../context';

export default function useHitOptions() {
  const polyhedron = PolyhedronCtx.useState();
  const { isTransitioning } = TransitionCtx.useState();
  const { operation, options } = OperationCtx.useState();
  const { setOption } = OperationCtx.useActions();
  const applyOperation = useApplyOperation();
  const { hitOption, getHitOption } = operation || {};

  const setHitOption = (hitPnt: Point) => {
    if (!operation || isTransitioning) return;
    const newHitOptions = getHitOption(polyhedron, hitPnt, options);
    if (_.isEmpty(newHitOptions)) {
      return setOption(hitOption, undefined);
    }
    const newValue = newHitOptions[hitOption];
    if (!_.isEqual(options[hitOption], newValue)) {
      setOption(hitOption, newValue);
    }
  };

  const unsetHitOption = () => {
    if (!operation) return;
    if (_.get(options, hitOption) !== undefined) {
      setOption(hitOption, undefined);
    }
  };

  const applyWithHitOption = (hitPnt: Point) => {
    if (!operation || isTransitioning) return;
    const newHitOptions = getHitOption(polyhedron, hitPnt, options);
    const newValue = newHitOptions[hitOption];
    // only apply operation if we have a hit
    if (options && newValue) {
      applyOperation(
        operation,
        { ...options, [hitOption]: newValue },
        result => {
          if (hitOption === 'cap' && options[hitOption]) {
            setOption('cap', options[hitOption].withPolyhedron(result));
          }
        },
      );
    }
  };
  return { setHitOption, unsetHitOption, applyWithHitOption };
}
