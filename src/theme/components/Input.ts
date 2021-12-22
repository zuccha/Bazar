export default {
  variants: {
    outline: (props: any) => {
      const { colorScheme } = props;
      return {
        field: {
          borderColor: `${colorScheme}.600`,
        },
      };
    },
  },
};
