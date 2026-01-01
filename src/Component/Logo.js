import Image from 'next/image';

const Logo = ({ src = '/icon/logo.svg', alt = 'Logo', width = 100, height = 100, ...props }) => {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      {...props}
    />
  );
};

export default Logo;