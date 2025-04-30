import RegisterContainer from '@/components/features/auth/RegisterContainer';
import Providers from '@/components/features/providers';

const register:React.FC =()=>{
    return(
        <Providers>
            <RegisterContainer></RegisterContainer>
        </Providers>
    )
}
export default register;