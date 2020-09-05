export default {
  event: 'ready',
  fn: (): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log('pleasant-cord is now ready to moderate servers');
    }
  },
};
