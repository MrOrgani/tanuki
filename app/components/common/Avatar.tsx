import Image from 'next/image';
import { memo } from 'react';
import styles from 'styles/components/common/Avatar.module.scss';

interface AvatarProps {
  url?: string;
  size?: 'm' | 's' | 'xs' | 'l' | 'xl';
  shape?: 'square' | 'circular';
}

interface Dimensions {
  width: string;
  height: string;
}

const getDimensions = (size: AvatarProps['size']): Dimensions => {
  switch (size) {
    case 'xs':
      return { width: '24px', height: '24px' };
    case 's':
      return { width: '32px', height: '32px' };
    case 'm':
      return { width: '54px', height: '54px' };
    case 'l':
      return { width: '110px', height: '110px' };
    case 'xl':
      return { width: '170px', height: '170px' };
  }

  return { width: '54px', height: '54px' };
};

const Avatar = memo(({ url, size = 'm', shape = 'circular' }: AvatarProps) => {
  const { width, height } = getDimensions(size);
  return (
    <div className={`${styles.avatar} ${styles[size]}`}>
      <Image
        alt={url ? "Avatar de l'employé" : 'Avatar par défaut'}
        src={url || '/images/hubvisor.svg'}
        width={width}
        height={height}
        className={styles[shape]}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.src = '/images/hubvisor.svg';
          currentTarget.srcset = '/images/hubvisor.svg';
          currentTarget.alt = 'Avatar par défaut';
        }}
      />
    </div>
  );
});

Avatar.displayName = 'Avatar';

export default Avatar;
