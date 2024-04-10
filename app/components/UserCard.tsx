import styles from 'styles/components/UserCard.module.scss';
import Avatar from 'components/common/Avatar';
import { useUser } from 'contexts/user';

const UserCard = () => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <div className={styles.userCard}>
      <span className={styles.picture}>
        <Avatar url={user.pictureURL} size="s" shape="square" />
      </span>
      <div className={styles.content}>
        <span className={styles.title}>{user.name}</span>
        <span className={styles.details}>{user.email}</span>
      </div>
    </div>
  );
};

export default UserCard;
