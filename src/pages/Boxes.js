import { useContext, useState, useEffect } from "react";
import { UserContext } from "../Services/Login";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/auth";
import { Link, Route, Routes, useNavigate, useParams } from "react-router-dom";

const Box = () => {
  const { user } = useContext(UserContext);
  const { boxName } = useParams();
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  // Retrieve the images for the selected box
  const retrieveImages = async () => {
    const uid = user.uid;
    const folderPath = `users/folders/${uid}`;

    try {
      const folderRef = firebase.storage().ref(folderPath);
      const folderItems = await folderRef.listAll();
      const imageUrls = await Promise.all(
        folderItems.items.map((item) => item.getDownloadURL())
      );
      setImages(imageUrls);
    } catch (error) {
      console.log("Error retrieving images:", error);
    }
  };

  useEffect(() => {
    retrieveImages();
  }, [boxName]);

  return (
    <div>
      <h1>Box: {boxName}</h1>
      <button onClick={() => navigate("/boxes")}>Go Back</button>
      {images.map((imageUrl, index) => (
        <img key={index} src={imageUrl} alt={`Image ${index + 1}`} />
      ))}
    </div>
  );
};

const Boxes = () => {
  const { boxes } = useContext(UserContext);
  const { user } = useContext(UserContext);
  const [boxName, setBoxName] = useState("");
  const navigate = useNavigate();

  const createBox = async () => {
    const uid = user.uid;
    const folderPath = `users/folders/${uid}/${boxName}/`;



    try {
      if (boxes.some((folder) => folder.name.startsWith(boxName + "/"))) {
        console.log("Box already exists.");
        return;
      }
      const folderRef = firebase.storage().ref(folderPath);
      await folderRef.child(".keep").putString("");
      console.log("Box created successfully.");

      // Reset the boxName state to empty string
      setBoxName("");
    } catch (error) {
      console.log("Error creating box:", error);
    }
  };

  return (
    <>
      <h1>Boxes</h1>
      <span>
        <h2>Create a Box:</h2>
        <input
          type="text"
          value={boxName}
          onChange={(e) => setBoxName(e.target.value)}
          placeholder="Enter box name"
        />
        <button onClick={createBox}>Create Box</button>
      </span>

      {boxes && (
        <ul>
          {boxes.map((folder, index) => {
            // Check if the folder name ends with a trailing slash
            if (folder.name.endsWith("/")) {
              const boxName = folder.name.substring(
                0,
                folder.name.length - 1
              ); // Remove the trailing slash
              const boxPath = `/boxes/${boxName}`; // Generate the box route path
              return (
                <li key={index}>
                  <Link to={boxPath}>{boxName}</Link>
                </li>
              );
            } else {
              return null;
            }
          })}
        </ul>
      )}

      <Routes>
        <Route path="/boxes/:boxName" element={<Box />} />
      </Routes>
    </>
  );
};

export default Boxes;
