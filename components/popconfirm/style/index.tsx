import type { FullToken, GenerateStyle } from '../../theme';
import { genComponentStyleHook } from '../../theme';

export interface ComponentToken {
  zIndexPopup: number;
}

export interface PopconfirmToken extends FullToken<'Popconfirm'> {}

// =============================== Base ===============================
const genBaseStyle: GenerateStyle<PopconfirmToken> = (token) => {
  const {
    componentCls,
    iconCls,
    zIndexPopup,
    colorText,
    colorWarning,
    marginXS,
    fontSize,
    lineHeight,
  } = token;

  return {
    [componentCls]: {
      zIndex: zIndexPopup,

      [`${componentCls}-inner-content`]: {
        color: colorText,
      },

      [`${componentCls}-message`]: {
        position: 'relative',
        marginBottom: marginXS,
        color: colorText,
        fontSize,
        display: 'flex',
        flexWrap: 'nowrap',
        alignItems: 'start',

        [`> ${componentCls}-message-icon ${iconCls}`]: {
          color: colorWarning,
          fontSize,
          flex: 'none',
          lineHeight: 1,
          paddingTop: (Math.round(fontSize * lineHeight) - fontSize) / 2,
        },

        '&-title': {
          flex: 'auto',
          marginInlineStart: marginXS,
        },
      },

      [`${componentCls}-buttons`]: {
        textAlign: 'end',

        button: {
          marginInlineStart: marginXS,
        },
      },
    },
  };
};

// ============================== Export ==============================
export default genComponentStyleHook(
  'Popconfirm',
  (token) => genBaseStyle(token),
  (token) => {
    const { zIndexPopupBase } = token;

    return {
      zIndexPopup: zIndexPopupBase + 60,
    };
  },
);
