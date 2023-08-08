import { useContext, useState, useEffect } from "react";
import { UserContext } from "../Services/Login";
import "../styles/images.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { Link, useLocation } from "react-router-dom";

const Box = ({ boxName }) => {
  const [images, setImages] = useState([]); // State to store images
  const { user } = useContext(UserContext);

  useEffect(() => {
    // Fetch and display images from Firebase Storage for the specific box
    const fetchImages = async () => {
      try {
        const imagesRef = firebase.storage().ref(`users/folders/${user.uid}/${boxName}`);
        const imagesList = await imagesRef.listAll();

        const imageUrls = await Promise.all(imagesList.items.map(async (item) => {
          const name = item.name.toLowerCase();
          if (name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".png")) {
            const url = await item.getDownloadURL();
            return url;
          }
          return null;
        }));

        setImages(imageUrls.filter(url => url !== null));
      } catch (error) {
        console.log("Error fetching images:", error);
      }
    };

    fetchImages();
  }, [user?.uid, boxName]);

  return (
    <div>
      <h2>{boxName} Images</h2>
      <div className="images-grid">
        {images.map((imageUrl, index) => (
          <div className="image-container" key={index}>
            <img src={imageUrl} alt={`Image ${index}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Boxes = () => {
  const { boxes, user } = useContext(UserContext);
  const [boxNames, setBoxNames] = useState([]);
  const [boxName, setBoxName] = useState("");
  const [selectedBox, setSelectedBox] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedBoxFromUrl = queryParams.get("boxName");


  const fetchBoxNames = async () => {
    try {
      if (user?.uid) {
        const userBoxesRef = firebase.storage().ref(`users/folders/${user.uid}`);
        const userBoxesList = await userBoxesRef.listAll();

        const boxNamesList = await Promise.all(userBoxesList.prefixes.map(async (folder) => {
          const folderName = folder.name.split("/").pop();
          return folderName;
        }));

        setBoxNames(boxNamesList);
      }
    } catch (error) {
      console.log("Error fetching box names:", error);
    }
  };

  const handleDeleteBox = async (boxName) => {
    if (!user?.uid) {
      console.log("Login to delete a box.");
      return;
    }
  
    const folderPath = `users/folders/${user.uid}/${boxName}`;
  
    try {
      console.log("Attempting to delete folder at path:", folderPath);
  
      const folderRef = firebase.storage().ref(folderPath);
      const items = await folderRef.listAll();
  
      // Delete each item (file) within the folder
      await Promise.all(items.items.map(item => item.delete()));
  
  
      console.log("Box and its contents deleted successfully.");
  
      // Update the boxNames state to remove the deleted box name
      setBoxNames(prevBoxNames => prevBoxNames.filter(name => name !== boxName));
    } catch (error) {
      console.log("Error deleting box:", error.code, error.message);
    }
  };
  
  const handleUpload = async (boxName) => {
    if (!user?.uid) {
      console.log("Login to upload.");
      return;
    }
  
    const folderPath = `users/folders/${user.uid}/${boxName}`;
  
    try {
      console.log("Attempting to upload to a folder at path:", folderPath);
  
      const folderRef = firebase.storage().ref(folderPath); // Reference to the folder
  
      // Create an input element for file selection
      const inputElement = document.createElement("input");
      inputElement.type = "file";
      inputElement.accept = "image/*"; // Allow only image files
  
      // Listen for changes to the input element
      inputElement.addEventListener("change", async (event) => {
        const file = event.target.files[0]; // Get the selected file
        if (file) {
          const fileRef = folderRef.child(file.name); // Create a reference to the file within the folder
          await fileRef.put(file); // Upload the file
          console.log("File uploaded successfully.");
        }
      });
  
      // Trigger the input element's click event to open the file picker dialog
      inputElement.click();
    } catch (error) {
      console.log("Error uploading:", error.code, error.message);
    }
  };
  
  

  useEffect(() => {
    fetchBoxNames();
  }, [user?.uid]);

  const createBox = async () => {
    if (!user?.uid) {
      console.log("Login to create a box.");
      return;
    }
  
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
  
      setBoxName("");
  
      // Update the boxNames state with the new box name
      setBoxNames(prevBoxNames => [...prevBoxNames, boxName]);
    } catch (error) {
      console.log("Error creating box:", error);
    }
  };
  

  const handleBoxClick = (boxName) => {
    setSelectedBox(boxName);
  };



  return (
    <>
      <h1>Boxes</h1>

      <div>
  <h2>Create a Box:</h2>
  <form onSubmit={createBox}>
    <input
      type="text"
      value={boxName}
      onChange={(e) => setBoxName(e.target.value)}
      placeholder="Enter box name"
      disabled={!user?.uid}
    />
    <button type="submit" disabled={!user?.uid}>
      Create Box
    </button>
  </form>
</div>

      {boxNames.length > 0 && (
        <div className="box-names">
          {boxNames.map((boxName, index) => (
            <div key={index} className="box-name">
              <Link to={`/boxes?boxName=${boxName}`}>{boxName}</Link>
              <div>
                <button onClick={() => handleDeleteBox(boxName)}>Delete</button>
                <button onClick={() => handleUpload(boxName)}>Upload</button>
                <Link to={`/boxes?boxName=${boxName}`}>QR</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBox || selectedBoxFromUrl ? <Box boxName={selectedBox || selectedBoxFromUrl} /> : null}
    </>
  );
};




export default Boxes;