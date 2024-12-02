import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
const Category = () => {
  const [category, setCategory] = useState([]);
  useEffect(() => {
    axios
      .get("http://localhost:3000/auth/category")
      .then((result) => {
        if (result.data.Status) {
          setCategory(result.data.Result);
        } else {
          alert(result.data.Error);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = (id) => {
    axios
      .delete("http://localhost:3000/auth/delete_category/" + id)
      .then((result) => {
        if (result.data.Status) {
          window.location.reload(
            alert(`Cập nhật Category mới cho Employee vừa xóa nhé !!`)
          );
        } else alert(result.data.Error);
      });
  };

  return (
    <div className="px-5 mt-3">
      <div className="d-flex justify-content-center">
        <h3>Categories List</h3>
      </div>
      <Link to="/dashboard/add_category" className="btn btn-success">
        Thêm PB
      </Link>
      <div className="mt-3">
      <table className="table">
          <thead>
            <tr>
              <th>Tên PB</th>
              <th>Thao Tác</th>
            </tr>
          </thead>

          <tbody>
            {category.length > 0 ? (
              category.map((c) => {
                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="2" className="text-center">
                  Không có danh mục nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Category;
