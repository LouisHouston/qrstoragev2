import { signOut } from "../Services/firebaseauth"
export const Profile = () => {
    return(
        <button onClick={signOut}> Sign Out!</button>
    )
}

export default Profile;