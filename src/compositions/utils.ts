export const processProps = (componentProps: Record<string, any>) => {
    const processedProps = { ...componentProps };
    if ('size' in processedProps) {
      const [width, height] = processedProps.size.split(',').map(Number);
      processedProps.width = width;
      processedProps.height = height;
      delete processedProps.size;
    } else {
      processedProps.width = processedProps.width || 1280;
      processedProps.height = processedProps.height || 720;
    }
    return processedProps;
}