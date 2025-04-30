import LoginContainer from '@/components/features/auth/LoginContainer';
import Providers from '@/components/features/providers';

const login:React.FC =()=>{
    return(
        <Providers>
            <LoginContainer></LoginContainer>
        </Providers>
    )
}
export default login;