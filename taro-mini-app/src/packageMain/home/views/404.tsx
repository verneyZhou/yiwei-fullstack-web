import {Link} from '@/components/link'; 

export default function NoMatch() {
  return (
    <div>
      <h2>404.</h2>
      <p>
        <Link to='/'>Go to the home page</Link>
      </p>
    </div>
  );
}
  
