import { initials } from '@/lib/utilities';
import SafeImage from './SafeImage';

// Profile photo if the member has one, otherwise their initials.
export default function Avatar({ user, large = false }) {
  return (
    <span className={`avatar ${large ? 'avatar-lg' : ''}`} aria-hidden="true">
      {user.profileImage ? <SafeImage src={user.profileImage} alt="" className="avatar-img" /> : initials(user.name)}
    </span>
  );
}
