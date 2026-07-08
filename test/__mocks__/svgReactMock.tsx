import React from 'react';
// фикс импорта svg
const SvgMock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <svg data-testid="svg-mock" {...props} />;
export default SvgMock;
