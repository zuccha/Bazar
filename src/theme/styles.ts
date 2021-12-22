const makeScrollbarStyle = (color: string) => ({
  background: color,
});

const styles = {
  global: {
    '::-webkit-scrollbar': { width: '10px', height: '10px' },
    '::-webkit-scrollbar-track': makeScrollbarStyle('#E5E5E5'),
    '::-webkit-scrollbar-thumb': makeScrollbarStyle('#AAAAAA'),
    '::-webkit-scrollbar-thumb:hover': makeScrollbarStyle('#888888'),
  },
};

export default styles;
