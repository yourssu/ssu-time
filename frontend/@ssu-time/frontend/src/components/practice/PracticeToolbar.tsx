import React, { useState } from 'react';
import { colors } from '../../theme/colors';

interface PracticeToolbarProps {
  onViewToggle?: () => void;
  onTimeSettingClick?: () => void;
  onEditScript?: () => void;
  onGenerateScript?: () => void;
  onPracticeToggle?: () => void;
  onHideStatus?: () => void;
  onToggleTimer?: () => void;
  onEnd?: () => void;
  currentPageTime?: { minutes: number; seconds: number };
  isPracticing?: boolean;
  disabled?: boolean;
  currentSlide?: number;
  totalSlides?: number;
}

export const PracticeToolbar: React.FC<PracticeToolbarProps> = ({
  onViewToggle,
  onTimeSettingClick,
  onEditScript,
  onGenerateScript,
  onEnd,
  disabled = false,
}) => {
  const [viewHovered, setViewHovered] = useState(false);
  const [scriptHovered, setScriptHovered] = useState(false);
  const [timerHovered, setTimerHovered] = useState(false);
  const [magicHovered, setMagicHovered] = useState(false);
  


  return (
    <div style={toolbarContainerStyle}>
      <div style={toolbarStyle}>
        {/* 좌측 영역: 마법사 버튼 + 3버튼 그룹 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onGenerateScript}
            style={{
              ...magicButtonStyle,
              backgroundColor: magicHovered ? '#2a74e6' : colors.primary.normal,
              opacity: disabled ? 0.6 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={() => setMagicHovered(true)}
            onMouseLeave={() => setMagicHovered(false)}
            disabled={disabled}
            aria-label="대본 생성"
            title="대본 생성"
          >
            <MagicIcon />
          </button>
          <div style={leftSectionStyle}>
            <button
              onClick={onViewToggle}
              style={{
                ...roundedIconButtonStyle,
                backgroundColor: colors.fill.neutral,
                outline: viewHovered ? `1px solid ${colors.fill.neutral}` : 'none',
              }}
              onMouseEnter={() => setViewHovered(true)}
              onMouseLeave={() => setViewHovered(false)}
              disabled={disabled}
              aria-label="뷰 토글"
            >
              <EyeHiddenIcon />
            </button>
            <button
              onClick={onTimeSettingClick}
              style={{
                ...roundedIconButtonStyle,
                backgroundColor: colors.fill.neutral,
                outline: timerHovered ? `1px solid ${colors.fill.neutral}` : 'none',
              }}
              onMouseEnter={() => setTimerHovered(true)}
              onMouseLeave={() => setTimerHovered(false)}
              disabled={disabled}
              aria-label="타이머 설정"
            >
              <ClockIcon />
            </button>
            <button
              onClick={() => {
                if (onEditScript) onEditScript();
              }}
              style={{
                ...roundedIconButtonStyle,
                backgroundColor: colors.fill.neutral,
                outline: scriptHovered ? `1px solid ${colors.fill.neutral}` : 'none',
              }}
              onMouseEnter={() => setScriptHovered(true)}
              onMouseLeave={() => setScriptHovered(false)}
              disabled={disabled}
              aria-label="대본 편집"
              title="미리보기 오버레이에서만 열람 가능"
            >
              <PencilIcon />
            </button>
          </div>
        </div>

        {/* 구분선(좌측 마지막 버튼과 16px 간격), 종료는 구분선에서 16px 간격 */}
        <div style={{ ...dividerStyle, marginLeft: '16px' }} />
        <div style={{ marginLeft: 'auto', paddingLeft: '16px', display: 'flex', alignItems: 'center' }}>
          <span
            role="button"
            onClick={onEnd}
            style={{
              fontFamily: 'Pretendard, sans-serif',
              fontSize: '12px',
              color: colors.primary.normal,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            종료
          </span>
        </div>
      </div>
    </div>
  );
};

// 아이콘 컴포넌트들 - 피그마 디자인에서 추출
/* unused icons removed to satisfy build */
/* const ViewIcon = () => (
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none">
    <path 
      d="M3.9074 9.02634C7.53762 2.82455 16.4624 2.82455 20.0926 9.02634C21.3025 11.0932 21.3025 13.6568 20.0926 15.7237C16.4624 21.9254 7.53762 21.9254 3.9074 15.7237C2.69753 13.6568 2.69753 11.0932 3.9074 9.02634Z" 
      stroke="#7D7E83" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M15.5567 12.4357C15.5567 14.4311 13.9637 16.0483 11.9994 16.0483C10.0352 16.0483 8.44331 14.4311 8.44331 12.4357C8.44331 10.4391 10.0352 8.82199 11.9994 8.82199C13.9637 8.82199 15.5567 10.4391 15.5567 12.4357Z" 
      stroke="#7D7E83" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
); */

/* const ScriptIcon = () => (
  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1009_2446)">
      <path d="M21 12.375V17.775C21 19.755 19.38 21.375 17.4 21.375H6.59998C4.61998 21.375 3 19.755 3 17.775V6.97501C3 4.99501 4.61998 3.375 6.59998 3.375H12" stroke="#7D7E83" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18.5001 9.54477L14.4001 13.6447C14.2201 13.8247 14.0101 13.9248 13.7601 13.9448L11.3101 14.1747C10.6701 14.2347 10.1301 13.6848 10.1901 13.0448L10.4101 10.6648C10.4301 10.4148 10.5301 10.1947 10.7101 10.0247L14.8501 5.88477L18.5001 9.54477V9.54477Z" stroke="#7D7E83" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M20.7001 7.35453L18.5001 9.54454L14.8501 5.88453L17.0401 3.69453C17.4401 3.29453 18.1001 3.29453 18.5001 3.69453L20.7001 5.88453C21.0901 6.28453 21.0901 6.95453 20.7001 7.35453V7.35453Z" stroke="#7D7E83" strokeWidth="1.5" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_1009_2446">
        <rect width="24" height="24" fill="white" transform="translate(0 0.375)"/>
      </clipPath>
    </defs>
  </svg>
); */

/* const TimerGoalIcon = () => (
  <svg width="18" height="21" viewBox="0 0 18 21" fill="none">
    <path 
      d="M8.99988 19.4041C13.0702 19.4041 16.3699 15.9925 16.3699 11.7841C16.3699 7.57565 13.0702 4.16406 8.99988 4.16406C4.92954 4.16406 1.62988 7.57565 1.62988 11.7841C1.62988 15.9925 4.92954 19.4041 8.99988 19.4041Z" 
      stroke="#7D7E83" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    <path 
      d="M1.86987 3.42453L4.66987 1.39453" 
      stroke="#7D7E83" 
      strokeWidth="1.5" 
      strokeMiterlimit="10" 
      strokeLinecap="round"
    />
    <path 
      d="M16.6298 3.42453L13.8298 1.39453" 
      stroke="#7D7E83" 
      strokeWidth="1.5" 
      strokeMiterlimit="10" 
      strokeLinecap="round"
    />
    <path 
      d="M9 8.7041V11.9841L11.26 13.9341" 
      stroke="#7D7E83" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
); */


// 스타일 정의 - 피그마 디자인에 정확히 맞춤
const toolbarContainerStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '4px 0',
  backgroundColor: colors.background.normal,
};

const toolbarStyle: React.CSSProperties = {
  backgroundColor: colors.background.normal,
  borderRadius: '16px',
  border: `0.5px solid ${colors.fill.neutral}`,
  boxShadow: '1px 1px 5px 0px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  padding: '0 24px',
  gap: 0,
  height: '48px',
  fontFamily: 'Pretendard, sans-serif',
};

const leftSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

/* const viewToggleButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '7px',
  transition: 'background-color 0.2s ease',
}; */

const dividerStyle: React.CSSProperties = {
  width: '0.5px',
  height: '23px',
  backgroundColor: colors.fill.neutral,
};

// removed unused timerBoxStyle per simplified toolbar spec

// removed unused rightSectionStyle per simplified toolbar spec

/* const actionButtonsStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}; */

/* const iconButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '5px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '7px',
  transition: 'background-color 0.2s ease',
  width: '34px',
  height: '34px',
}; */

// 32x32 둥근 회색 버튼
const roundedIconButtonStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '12px',
  border: 'none',
  backgroundColor: colors.fill.neutral,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
  cursor: 'pointer',
};

/* const endButtonStyle: React.CSSProperties = {
  backgroundColor: colors.primary.normal,
  color: colors.static.white,
  border: 'none',
  borderRadius: '8px',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 500,
  fontFamily: 'Pretendard, sans-serif',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',
  lineHeight: 1,
}; */

/* const slideInfoStyle: React.CSSProperties = {
  fontSize: '8px',
  fontWeight: 400,
  color: colors.label.neutral,
  fontFamily: 'Pretendard, sans-serif',
  lineHeight: 1,
}; */

/* const timerTextStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '13px',
  fontWeight: 400,
  color: colors.label.neutral,
  fontFamily: 'Pretendard, sans-serif',
}; */

// 피그마 Variant9(마법사) 스타일
const magicButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: '12px',
  width: '32px',
  height: '32px',
  padding: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const MagicIcon = () => (
  <svg width="14.5" height="14.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.35973 2.1087C8.35973 2.22888 8.40747 2.34413 8.49245 2.42911C8.57743 2.51409 8.69268 2.56183 8.81286 2.56183C8.93303 2.56183 9.04829 2.51409 9.13326 2.42911C9.21824 2.34413 9.26598 2.22888 9.26598 2.1087V0.451172C9.26598 0.330996 9.21824 0.215742 9.13326 0.130764C9.04829 0.0457867 8.93303 -0.00195312 8.81286 -0.00195312C8.69268 -0.00195312 8.57743 0.0457867 8.49245 0.130764C8.40747 0.215742 8.35973 0.330996 8.35973 0.451172V2.1087ZM12.4379 2.14042C12.5204 2.05496 12.5661 1.9405 12.565 1.82169C12.564 1.70289 12.5163 1.58924 12.4323 1.50522C12.3483 1.42121 12.2347 1.37356 12.1159 1.37252C11.9971 1.37149 11.8826 1.41716 11.7971 1.4997L10.6254 2.67148C10.5821 2.71328 10.5476 2.76328 10.5238 2.81857C10.5001 2.87385 10.4876 2.93331 10.487 2.99347C10.4865 3.05364 10.498 3.11331 10.5208 3.16899C10.5435 3.22468 10.5772 3.27527 10.6197 3.31782C10.6623 3.36036 10.7129 3.39401 10.7686 3.41679C10.8243 3.43958 10.8839 3.45104 10.9441 3.45052C11.0042 3.45 11.0637 3.4375 11.119 3.41375C11.1743 3.39 11.2243 3.35548 11.2661 3.3122L12.4379 2.14042ZM6.35964 3.3122C6.40144 3.35548 6.45144 3.39 6.50672 3.41375C6.562 3.4375 6.62146 3.45 6.68163 3.45052C6.74179 3.45104 6.80146 3.43958 6.85715 3.41679C6.91284 3.39401 6.96343 3.36036 7.00597 3.31782C7.04852 3.27527 7.08216 3.22468 7.10495 3.16899C7.12773 3.11331 7.1392 3.05364 7.13867 2.99347C7.13815 2.93331 7.12565 2.87385 7.1019 2.81857C7.07815 2.76328 7.04363 2.71328 7.00036 2.67148L5.82857 1.4997C5.74311 1.41716 5.62865 1.37149 5.50985 1.37252C5.39104 1.37356 5.27739 1.42121 5.19338 1.50522C5.10936 1.58924 5.06171 1.70289 5.06068 1.82169C5.05964 1.9405 5.10532 2.05496 5.18786 2.14042L6.35964 3.3122ZM5.79686 5.57783C5.91703 5.57783 6.03229 5.53009 6.11726 5.44511C6.20224 5.36013 6.24998 5.24488 6.24998 5.1247C6.24998 5.00453 6.20224 4.88927 6.11726 4.8043C6.03229 4.71932 5.91703 4.67158 5.79686 4.67158H4.13933C4.01915 4.67158 3.90389 4.71932 3.81892 4.8043C3.73394 4.88927 3.6862 5.00453 3.6862 5.1247C3.6862 5.24488 3.73394 5.36013 3.81892 5.44511C3.90389 5.53009 4.01915 5.57783 4.13933 5.57783H5.79686ZM13.4864 5.57783C13.6066 5.57783 13.7218 5.53009 13.8068 5.44511C13.8918 5.36013 13.9395 5.24488 13.9395 5.1247C13.9395 5.00453 13.8918 4.88927 13.8068 4.8043C13.7218 4.71932 13.6066 4.67158 13.4864 4.67158H11.8289C11.7087 4.67158 11.5934 4.71932 11.5084 4.8043C11.4235 4.88927 11.3757 5.00453 11.3757 5.1247C11.3757 5.24488 11.4235 5.36013 11.5084 5.44511C11.5934 5.53009 11.7087 5.57783 11.8289 5.57783H13.4864ZM11.7971 8.7497C11.8389 8.79298 11.8889 8.8275 11.9442 8.85125C11.9995 8.875 12.059 8.8875 12.1191 8.88802C12.1793 8.88854 12.239 8.87708 12.2946 8.85429C12.3503 8.83151 12.4009 8.79786 12.4435 8.75532C12.486 8.71278 12.5197 8.66218 12.5424 8.60649C12.5652 8.55081 12.5767 8.49114 12.5762 8.43097C12.5756 8.37081 12.5632 8.31135 12.5394 8.25607C12.5157 8.20078 12.4811 8.15078 12.4379 8.10898L11.2661 6.9372C11.2243 6.89393 11.1743 6.85941 11.119 6.83566C11.0637 6.81191 11.0042 6.79941 10.9441 6.79889C10.8839 6.79836 10.8243 6.80983 10.7686 6.83261C10.7129 6.8554 10.6623 6.88904 10.6197 6.93159C10.5772 6.97413 10.5435 7.02472 10.5208 7.08041C10.498 7.1361 10.4865 7.19577 10.487 7.25593C10.4876 7.3161 10.5001 7.37556 10.5238 7.43084C10.5476 7.48612 10.5821 7.53612 10.6254 7.57792L11.7971 8.7497ZM8.35973 9.79823C8.35973 9.91841 8.40747 10.0337 8.49245 10.1186C8.57743 10.2036 8.69268 10.2514 8.81286 10.2514C8.93303 10.2514 9.04829 10.2036 9.13326 10.1186C9.21824 10.0337 9.26598 9.91841 9.26598 9.79823V8.1407C9.26598 8.02053 9.21824 7.90527 9.13326 7.82029C9.04829 7.73532 8.93303 7.68758 8.81286 7.68758C8.69268 7.68758 8.57743 7.73532 8.49245 7.82029C8.40747 7.90527 8.35973 8.02053 8.35973 8.1407V9.79823ZM10.0399 5.17908C10.1246 5.09414 10.1721 4.9791 10.1721 4.85917C10.1721 4.73924 10.1246 4.6242 10.0399 4.53927L9.39829 3.89764C9.31332 3.81269 9.19809 3.76497 9.07793 3.76497C8.95778 3.76497 8.84255 3.81269 8.75757 3.89764L7.58579 5.07033C7.50085 5.1553 7.45312 5.27053 7.45312 5.39069C7.45312 5.51084 7.50085 5.62607 7.58579 5.71105L8.22742 6.35267C8.31239 6.43762 8.42763 6.48534 8.54778 6.48534C8.66793 6.48534 8.78316 6.43762 8.86814 6.35267L10.0399 5.18089V5.17908ZM7.32117 7.89783C7.40584 7.81289 7.45338 7.69785 7.45338 7.57987C7.45338 7.45799 7.40584 7.34295 7.32117 7.25802L6.67954 6.61639C6.59457 6.53144 6.47934 6.48372 6.35918 6.48372C6.23903 6.48372 6.1238 6.53144 6.03883 6.61639L0.335794 12.3203C0.250846 12.4053 0.203125 12.5205 0.203125 12.6407C0.203125 12.7608 0.250846 12.8761 0.335794 12.961L0.977419 13.6027C1.06239 13.6876 1.17763 13.7353 1.29778 13.7353C1.41793 13.7353 1.53316 13.6876 1.61814 13.6027L7.32117 7.89783Z" fill="#FFFFFF"/>
  </svg>
);

// View toggle icons (18x18) per spec
const EyeHiddenIcon = () => (
  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1424_5448)">
      <path d="M9.00098 4.25C11.6227 4.25033 13.7522 5.69361 15.2559 7.19727C16.0034 7.94485 16.5826 8.69433 16.9746 9.25684C17.1703 9.53759 17.3184 9.77107 17.417 9.93262C17.4178 9.93386 17.4182 9.93529 17.4189 9.93652C17.4063 9.95721 17.3942 9.97989 17.3799 10.0029C17.2562 10.2024 17.0712 10.4883 16.8271 10.8262C16.4011 11.416 15.7994 12.1595 15.042 12.8857L14.9531 12.7969C15.0255 12.7275 15.0982 12.6596 15.168 12.5898C15.9081 11.8497 16.4831 11.1052 16.8721 10.5479L16.873 10.5469C16.9583 10.4243 17.0326 10.3124 17.0977 10.2148L17.2812 9.93945L17.0996 9.66309C16.5372 8.80838 15.8905 8.01153 15.1689 7.28613L15.168 7.28516L14.8809 7.00684C13.4593 5.66678 11.5469 4.45803 9.24023 4.37891L9 4.375H8.99902C8.27336 4.37677 7.55243 4.48787 6.86133 4.70508L6.76074 4.60547C7.48342 4.37316 8.23892 4.25271 9.00098 4.25Z" fill="#78787B" stroke="#78787B"/>
      <path d="M12.7093 11.2607C12.9603 10.5585 13.0068 9.79944 12.8433 9.07188C12.6799 8.34431 12.3132 7.67812 11.7859 7.15083C11.2586 6.62353 10.5924 6.25681 9.86481 6.09334C9.13724 5.92986 8.37821 5.97636 7.67603 6.2274L8.6019 7.15328C9.03425 7.0914 9.47507 7.13105 9.88943 7.26911C10.3038 7.40717 10.6803 7.63983 10.9891 7.94867C11.298 8.2575 11.5306 8.63401 11.6687 9.04837C11.8068 9.46274 11.8464 9.90356 11.7845 10.3359L12.7093 11.2607ZM9.3984 12.722L10.3232 13.6468C9.62098 13.8978 8.86194 13.9443 8.13438 13.7808C7.40681 13.6174 6.74062 13.2507 6.21333 12.7234C5.68603 12.1961 5.31931 11.5299 5.15584 10.8023C4.99236 10.0747 5.03886 9.31571 5.2899 8.61353L6.21578 9.5394C6.1539 9.97175 6.19355 10.4126 6.33161 10.8269C6.46967 11.2413 6.70233 11.6178 7.01117 11.9266C7.32 12.2355 7.69651 12.4681 8.11087 12.6062C8.52523 12.7443 8.96606 12.7839 9.3984 12.722Z" fill="#78787B"/>
      <path d="M3.76875 7.09106C3.56625 7.27106 3.37162 7.45331 3.186 7.63894C2.4881 8.34059 1.86246 9.11058 1.3185 9.93731L1.53787 10.2613C1.91475 10.8013 2.47163 11.5213 3.186 12.2357C4.63613 13.6858 6.61613 14.9998 9 14.9998C9.8055 14.9998 10.5638 14.8502 11.2725 14.5948L12.1388 15.4633C11.1487 15.8959 10.0805 16.1211 9 16.1248C3.375 16.1248 0 9.93731 0 9.93731C0 9.93731 1.05638 8.00119 2.97113 6.29456L3.76762 7.09219L3.76875 7.09106Z" fill="#78787B"/>
      <path d="M15.3517 17.0856L1.85175 3.58556L2.64825 2.78906L16.1483 16.2891L15.3517 17.0856Z" fill="#78787B"/>
    </g>
    <defs>
      <clipPath id="clip0_1424_5448">
        <rect width="18" height="18" fill="white" transform="translate(0 0.9375)"/>
      </clipPath>
    </defs>
  </svg>
);

/* const EyeVisibleIcon = () => (
  <svg width="18" height="19" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.9074 9.02634C7.53762 2.82455 16.4624 2.82455 20.0926 9.02634C21.3025 11.0932 21.3025 13.6568 20.0926 15.7237C16.4624 21.9254 7.53762 21.9254 3.9074 15.7237C2.69753 13.6568 2.69753 11.0932 3.9074 9.02634Z" stroke="#7D7E83" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12.4357" r="3.6" fill="#78787B" />
  </svg>
); */

const ClockIcon = () => (
  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_1424_5144)">
      <circle cx="9.00049" cy="9.0625" r="7.125" fill="#78787B"/>
      <path d="M8.20874 5.89648V9.85482H12.1671" stroke="white" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_1424_5144">
        <rect width="18" height="18" fill="white" transform="translate(0 0.0625)"/>
      </clipPath>
    </defs>
  </svg>
);

const PencilIcon = () => (
  <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.125 7.77832V14.625C15.125 15.0726 14.9472 15.5018 14.6307 15.8182C14.3143 16.1347 13.8851 16.3125 13.4375 16.3125H5.5625C5.11495 16.3125 4.68572 16.1347 4.36926 15.8182C4.05279 15.5018 3.875 15.0726 3.875 14.625V3.375C3.875 2.92745 4.05279 2.49822 4.36926 2.18176C4.68572 1.86529 5.11495 1.6875 5.5625 1.6875H9.03418C9.33244 1.68755 9.61848 1.80603 9.82941 2.01691L14.7956 6.98309C15.0065 7.19402 15.125 7.48006 15.125 7.77832Z" stroke="#78787B" strokeWidth="1.125" strokeLinejoin="round"/>
    <path d="M9.5 1.96875V6.1875C9.5 6.48587 9.61853 6.77202 9.82951 6.98299C10.0405 7.19397 10.3266 7.3125 10.625 7.3125H14.8437" stroke="#78787B" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.6875 10.125H12.3125" stroke="#78787B" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.6875 12.9375H12.3125" stroke="#78787B" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// removed unused ExitIcon per simplified toolbar spec