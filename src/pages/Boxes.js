import { useContext, useState, useEffect } from "react";
import { UserContext } from "../Services/Login";
import "../styles/images.css";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import { Link, useLocation, useNavigate } from "react-router-dom";
import QRCode from "qrcode.react"; 
import "../styles/alerts.css";

const Box = ({ boxName, fetchImages }) => {
  const [images, setImages] = useState([]); // State to store images
  const { user } = useContext(UserContext);

  useEffect(() => {
    // Fetch and display images from Firebase Storage for the specific box
    const fetchImages = async () => {
      try {
        const imagesRef = firebase
          .storage()
          .ref(`users/folders/${user.uid}/${boxName}`);
        const imagesList = await imagesRef.listAll();

        const imageUrls = await Promise.all(
          imagesList.items.map(async (item) => {
            const name = item.name.toLowerCase();
            if (
              name.endsWith(".jpg") ||
              name.endsWith(".jpeg") ||
              name.endsWith(".png")
            ) {
              const url = await item.getDownloadURL();
              return url;
            }
            return null;
          })
        );

        setImages(imageUrls.filter((url) => url !== null));
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
  const [images, setImages] = useState([]); // State to store images
  const { boxes, user } = useContext(UserContext);
  const [boxNames, setBoxNames] = useState([]);
  const [boxName, setBoxName] = useState("");
  const [selectedBox, setSelectedBox] = useState(null);
  const [selectedBoxForQR, setSelectedBoxForQR] = useState(null); // State for QR code generation
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedBoxFromUrl = queryParams.get("boxName");
  const history = useNavigate();
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({ message, type });
  };

  const fetchBoxNames = async () => {
    try {
      if (user?.uid) {
        const userBoxesRef = firebase
          .storage()
          .ref(`users/folders/${user.uid}`);
        const userBoxesList = await userBoxesRef.listAll();

        const boxNamesList = await Promise.all(
          userBoxesList.prefixes.map(async (folder) => {
            const folderName = folder.name.split("/").pop();
            return folderName;
          })
        );

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

      // Delete each pictures within the folder
      await Promise.all(items.items.map((item) => item.delete()));

      console.log("Box and its contents deleted successfully.");
      showAlert("Box deleted", "deleted");


      // Update the boxNames state to remove the deleted box name
      setBoxNames((prevBoxNames) =>
        prevBoxNames.filter((name) => name !== boxName)
      );
      history("/boxes");
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

      const folderRef = firebase.storage().ref(folderPath);
      const inputElement = document.createElement("input");
      inputElement.type = "file";
      inputElement.accept = "image/*";

      // promise user gets image
      const fileSelectedPromise = new Promise((resolve) => {
        inputElement.addEventListener("change", (event) => {
          resolve(event.target.files[0]);
        });
      });

      // trigger the input element's click event to open the file picker dialog
      inputElement.click();

      // Waiting for the user to select a file
      const selectedFile = await fileSelectedPromise;

      if (selectedFile) {
        const fileRef = folderRef.child(selectedFile.name);
        await fileRef.put(selectedFile);
        console.log("File uploaded successfully.");
        showAlert("Picture uploaded!", "success");
        // Fetch updated images for the box after uploading
        const imageUrls = await fetchImagesForBox(boxName);
        setImages(imageUrls);
      }
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
        showAlert("Box already exists.", "warning");
        return;
      }
      const folderRef = firebase.storage().ref(folderPath);
      await folderRef.child(".keep").putString("");
      console.log("Box created successfully.");
      showAlert("Box created successfully", "success");

      setBoxName("");

      // Update the boxNames state with the new box name
      setBoxNames((prevBoxNames) => [...prevBoxNames, boxName]);
      await fetchBoxNames;
      history("/boxes");
    } catch (error) {
      console.log("Error creating box:", error);
      showAlert("Error creating box.", "error");
    }
  };

  const handleBoxClick = (boxName) => {
    setSelectedBox(boxName);
  };

  const fetchImagesForBox = async (boxName) => {
    try {
      const imagesRef = firebase
        .storage()
        .ref(`users/folders/${user.uid}/${boxName}`);
      const imagesList = await imagesRef.listAll();

      const imageUrls = await Promise.all(
        imagesList.items.map(async (item) => {
          const name = item.name.toLowerCase();
          if (
            name.endsWith(".jpg") ||
            name.endsWith(".jpeg") ||
            name.endsWith(".png")
          ) {
            const url = await item.getDownloadURL();
            return url;
          }
          return null;
        })
      );

      return imageUrls.filter((url) => url !== null);
    } catch (error) {
      console.log("Error fetching images:", error);
      return [];
    }
  };

  return (
    <>
      <h1>Boxes</h1>

      <div>
        <h2>Create a Box:</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createBox();
          }}
        >
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
        {alert && (
          <div className={`alert ${alert.type}`} onClick={() => setAlert(null)}>
            <span className="alertText">{alert.message}</span>
          </div>
        )}
      </div>

      {boxNames.length > 0 && (
        <div className="box-names">
          {boxNames.map((boxName, index) => (
            <div key={index} className="box-name">
              <Link to={`/boxes?boxName=${boxName}`}>{boxName}</Link>
              <div>
                <button onClick={() => handleDeleteBox(boxName)}>Delete</button>
                <button onClick={() => handleUpload(boxName)}>Upload</button>
                <button onClick={() => setSelectedBoxForQR(boxName)}>
                  Generate QR
                </button>
              </div>
              {selectedBoxForQR === boxName && (
                <div>
                  <QRCode
                    value={`${window.location.origin}/boxes?boxName=${boxName}`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedBox || selectedBoxFromUrl ? (
        <Box boxName={selectedBox || selectedBoxFromUrl} />
      ) : null}
    </>
  );
};

export default Boxes;
