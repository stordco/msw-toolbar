declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.svg' {
  import React from 'react';

  const SVGComponent: React.VFC<React.SVGProps<SVGSVGElement>>;
  export default SVGComponent;
}
