import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button, Navbar, Card, Dropdown, DropdownButton } from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import OffcanvasExample from "./TopNav";
import { useNavigate } from "react-router";
import { useUserAuth } from "../../context/UserAuth";
import "./Home.css"
import { addDoc, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const Home = () => {
  const [search, setSearch] = useState(); //keyword searched 
  const [movies, setMovies] = useState([]); //response 
  const [favList, setFavList] = useState([])
  const [dbData, setDbData] = useState([])
  const [allPlaylists, setAllPlaylists] = useState([{ name: "Favorites", pub: true, movies: [] }]);
  const [currentid, setCurrentid] = useState()
  const [isLoading, setIsLoading] = useState(false);
  const { logOut, user } = useUserAuth();
  let currUser = (user.email);

  let flag = 0;
  const userCollectionRef = collection(db, "users")
  const addFavHandler = (event) => {
    setFavList((current => [...current, event.target.id]))

    //console.log(favList)
  }

  const createUserDb = async () => {
    //put request

    await addDoc(userCollectionRef, { email: currUser, movies: [] })
  }


  const updatedb = async (arr) => {
    let userDoc

    console.log(`HERE IS ID:${arr}`)
    userDoc = doc(db, "users", currentid)
    const movies = { movies: arr }
    await updateDoc(userDoc, movies)



  }


  const getdb = async (currUser) => {
    //get request
    const userdata = await getDocs(userCollectionRef)
    let dbdatafetched = userdata.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

    console.log(dbdatafetched)
    dbdatafetched.map((res) => {

      if (res.email === currUser) {
        flag = 1
        setCurrentid(res.id)
        setFavList(res.movies)
        setDbData(res.movies) //setting movies here
      }
    })
    if (flag === 0) {
      await createUserDb(currUser)
      setDbData([])
    }

    flag = 0

  }



  const fetchMovieHandler = (event) => {
    setIsLoading(true)
    event.preventDefault();
    axios.get(`https://www.omdbapi.com/?s=${search}&apikey=d3bfd27a`)
      .then((response) => {

        setMovies(response.data.Search)
        getdb(user.email)
        setIsLoading(false)
      });

    console.log(dbData)
  }

  const preventEnterHandler = (e) => {
    if ((e.keyCode === 13)) {
      e.preventDefault();
      return false
    }
  }


  const onChangeHandler = (event) => {
    setSearch(event.target.value)
  }



  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error.message);
    }
  };
  const setNewMovieHandler = (val) => {
    let arr = [...favList, val]
    setFavList(arr)
    console.log(`Here is array: ${arr}`)
    updatedb(arr)



  }
  // const setNewMovieHandler = (curplay, val) => {

  //   setAllPlaylists(current =>
  //     current.map(obj => {

  //       if (obj.name === curplay) {
  //         const newMovieAddition = obj.movies.concat(val)

  //         return { ...obj, movies: newMovieAddition };
  //       }

  //       return obj;
  //     }),
  //   );
  //   console.log(allPlaylists)

  // }

  return (
    <div className="home">
      <OffcanvasExample handleLogout={handleLogout} favList={favList} />
      <div className="searchBar">
        <div className="background" />
        <h1 style={{ color: "white", marginBottom: "2rem" }}>Search and follow a watchlist!</h1>
        <Form className="d-flex" >

          <Form.Control type="search"
            placeholder="Search"
            onChange={onChangeHandler}
            className="me-3 bg-dark"
            style={{ color: "#fff" }}
            aria-label="Search"
            onKeyDown={preventEnterHandler}
          />

          <Button style={{ backgroundColor: "#ff6711", color: "white", border: "none" }} onClick={fetchMovieHandler}>Search</Button>
        </Form>
      </div>

      <div className="container">
        {isLoading ? <h4 className="m-5" style={{ color: "white" }}>Loading... </h4> :
          <div className="row">

            {movies ? movies.map((value, index) => {
              if (value.Poster === "N/A") {
                console.log(value.Title)
                return null
              }
              else {
                return (

                  <div className="col-3 my-3">

                    <Card style={{ backgroundColor: "#3d3d58" }}>
                      <Card.Img variant="top" src={value.Poster} />

                      <Card.Body style={{ backgroundColor: "#3d3d58", border: "0px" }}>

                        <Card.Text>
                          <h6 style={{ color: "#fafafa" }}>
                            {value.Title.length <= 25 ? value.Title : `${value.Title.slice(0, -(value.Title.length - 24))}...`}-{value.Year}</h6>

                        </Card.Text>

                        <div className="buttonCard">
                          <Button id={value.Title}
                            style={{ backgroundColor: "#16b57f", color: "black" }}
                            onClick={function () { setNewMovieHandler(value.Title); }}>
                            <div className="d-flex" style={{ width: "100%" }}>
                              <p>Add to Watchlist</p>
                              <div className="anim">⭐</div>
                            </div>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>

                  </div>

                );
              }
            })
              : <h4 className="m-5" style={{ color: "white" }}>No movies found☹ </h4>}

          </div>
        }
      </div>

    </div>




  );
};

export default Home;
