import classNames from 'classnames';
import RcMentions from 'rc-mentions';
import type {
  MentionsProps as RcMentionsProps,
  MentionsRef as RcMentionsRef,
} from 'rc-mentions/lib/Mentions';
import { composeRef } from 'rc-util/lib/ref';
// eslint-disable-next-line import/no-named-as-default
import * as React from 'react';
import { ConfigContext } from '../config-provider';
import defaultRenderEmpty from '../config-provider/defaultRenderEmpty';
import { FormItemInputContext } from '../form/context';
import genPurePanel from '../_util/PurePanel';
import Spin from '../spin';
import type { InputStatus } from '../_util/statusUtils';
import { getMergedStatus, getStatusClassNames } from '../_util/statusUtils';

import useStyle from './style';

export const { Option } = RcMentions;

function loadingFilterOption() {
  return true;
}

export type MentionPlacement = 'top' | 'bottom';

export interface OptionProps {
  value: string;
  children: React.ReactNode;
  [key: string]: any;
}

export interface MentionProps extends RcMentionsProps {
  loading?: boolean;
  status?: InputStatus;
  popupClassName?: string;
}

export interface MentionsRef extends RcMentionsRef {}

export interface MentionState {
  focused: boolean;
}

interface MentionsConfig {
  prefix?: string | string[];
  split?: string;
}

interface MentionsEntity {
  prefix: string;
  value: string;
}

type CompoundedComponent = React.ForwardRefExoticComponent<
  MentionProps & React.RefAttributes<MentionsRef>
> & {
  Option: typeof Option;
  _InternalPanelDoNotUseOrYouWillBeFired: typeof PurePanel;
  getMentions: (value: string, config?: MentionsConfig) => MentionsEntity[];
};

const InternalMentions: React.ForwardRefRenderFunction<MentionsRef, MentionProps> = (
  {
    prefixCls: customizePrefixCls,
    className,
    disabled,
    loading,
    filterOption,
    children,
    notFoundContent,
    status: customStatus,
    popupClassName,
    ...restProps
  },
  ref,
) => {
  const [focused, setFocused] = React.useState(false);
  const innerRef = React.useRef<MentionsRef>();
  const mergedRef = composeRef(ref, innerRef);
  const { getPrefixCls, renderEmpty, direction } = React.useContext(ConfigContext);
  const {
    status: contextStatus,
    hasFeedback,
    feedbackIcon,
  } = React.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);

  const onFocus: React.FocusEventHandler<HTMLTextAreaElement> = (...args) => {
    if (restProps.onFocus) {
      restProps.onFocus(...args);
    }
    setFocused(true);
  };

  const onBlur: React.FocusEventHandler<HTMLTextAreaElement> = (...args) => {
    if (restProps.onBlur) {
      restProps.onBlur(...args);
    }

    setFocused(false);
  };

  const getNotFoundContent = () => {
    if (notFoundContent !== undefined) {
      return notFoundContent;
    }

    return (renderEmpty || defaultRenderEmpty)('Select');
  };

  const getOptions = () => {
    if (loading) {
      return (
        <Option value="ANTD_SEARCHING" disabled>
          <Spin size="small" />
        </Option>
      );
    }

    return children;
  };

  const getFilterOption = (): any => {
    if (loading) {
      return loadingFilterOption;
    }
    return filterOption;
  };

  const prefixCls = getPrefixCls('mentions', customizePrefixCls);

  // Style
  const [wrapSSR, hashId] = useStyle(prefixCls);

  const mergedClassName = classNames(
    {
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-focused`]: focused,
      [`${prefixCls}-rtl`]: direction === 'rtl',
    },
    getStatusClassNames(prefixCls, mergedStatus),
    !hasFeedback && className,
    hashId,
  );

  const mentions = (
    <RcMentions
      prefixCls={prefixCls}
      notFoundContent={getNotFoundContent()}
      className={mergedClassName}
      disabled={disabled}
      direction={direction}
      {...restProps}
      filterOption={getFilterOption()}
      onFocus={onFocus}
      onBlur={onBlur}
      dropdownClassName={classNames(popupClassName, hashId)}
      ref={mergedRef as any}
    >
      {getOptions()}
    </RcMentions>
  );

  if (hasFeedback) {
    return (
      <div
        className={classNames(
          `${prefixCls}-affix-wrapper`,
          getStatusClassNames(`${prefixCls}-affix-wrapper`, mergedStatus, hasFeedback),
          className,
          hashId,
        )}
      >
        {mentions}
        <span className={`${prefixCls}-suffix`}>{feedbackIcon}</span>
      </div>
    );
  }

  return wrapSSR(mentions);
};

const Mentions = React.forwardRef<MentionsRef, MentionProps>(
  InternalMentions,
) as CompoundedComponent;
if (process.env.NODE_ENV !== 'production') {
  Mentions.displayName = 'Mentions';
}
Mentions.Option = Option;

// We don't care debug panel
/* istanbul ignore next */
const PurePanel = genPurePanel(Mentions, 'mentions');
Mentions._InternalPanelDoNotUseOrYouWillBeFired = PurePanel;

Mentions.getMentions = (value: string = '', config: MentionsConfig = {}): MentionsEntity[] => {
  const { prefix = '@', split = ' ' } = config;
  const prefixList: string[] = Array.isArray(prefix) ? prefix : [prefix];

  return value
    .split(split)
    .map((str = ''): MentionsEntity | null => {
      let hitPrefix: string | null = null;

      prefixList.some((prefixStr) => {
        const startStr = str.slice(0, prefixStr.length);
        if (startStr === prefixStr) {
          hitPrefix = prefixStr;
          return true;
        }
        return false;
      });

      if (hitPrefix !== null) {
        return {
          prefix: hitPrefix,
          value: str.slice((hitPrefix as string).length),
        };
      }
      return null;
    })
    .filter((entity): entity is MentionsEntity => !!entity && !!entity.value);
};

export default Mentions;
