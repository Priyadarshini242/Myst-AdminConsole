import React from 'react'
import { BsFillBriefcaseFill } from 'react-icons/bs'
import { FaSearch } from 'react-icons/fa'
import { IoHomeSharp } from "react-icons/io5";
const iconSize = 18;
const MenuItems = [
    {
        id: 1,
        path: "Home",
        module: "skillSeeker",
        icon: <IoHomeSharp size={iconSize} />,
        name: "Home"

    },
    {
        id: 2,
        path: "jdsearch",
        module: "skillSeeker",
        icon: <BsFillBriefcaseFill size={iconSize} />,
        name: "My JD'S"

    },
    {
        id: 3,
        path: "conventionalsearch",
        module: "skillSeeker",
        icon: <FaSearch size={iconSize} />,
        name: "Skill Search"

    },
]

export default MenuItems;



