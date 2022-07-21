const express = require('express')
const joyas = require('./data/joyas.js')
const app = express()
app.listen(3000, () => console.log('Your app listening on port 3000'))

app.use(express.static('public'))
// Crear una ruta para la devolución de todas las joyas aplicando HATEOAS. 

const HATEOAS = () =>
  joyas.map((g) => {
    return {
      name: g.name,
      href: `http://localhost:3000/joyas/${g.id}`
    };
  });

app.get("/joyas", (req, res) => {
  res.send({
    joyas: HATEOAS(),
  });
});

//  Hacer una segunda versión de la API que ofrezca los mismos datos pero con los
// nombres de las propiedades diferentes.

const HATEOASV2 = () =>
  joyas.map((g) => {
    return {
      model: g.name,
      value: g.value,
      url: `http://localhost:3000/joyas/${g.id}`
    }
  })
app.get("/joyas2.0", (req, res) => {
  res.send({
    joyas: HATEOASV2(),
  })
})

// La API REST debe poder ofrecer una ruta con la que se puedan filtrar las joyas por
// categoría.

const filtroByCategory = (category) => {
  return joyas.filter((g) => g.category === category);
};

app.get("/api/category/:category", (req, res) => {
  const category = req.params.category;
  res.send({
    joyas: filtroByCategory(category),
  })
})

//  Crear una ruta que permita el filtrado por campos de una joya a consulta

const filtroByMetal = (metal) => {
  return joyas.filter((h) => h.metal === metal);
};

app.get("/api/metal/:metal", (req, res) => {
  const metal = req.params.category;
  res.send({
    joyas: filtroByMetal(metal),
  })
})


const filtroByName = (name) => {
  return joyas.filter((g) => g.name === name);
};

app.get("/api/name/:name", (req, res) => {
  const name = req.params.category;
  res.send({
    joyas: filtroByName(name),
  })
})


//  Crear una ruta que devuelva como payload un JSON con un mensaje de error cuando
// el usuario consulte el id de una joya que no exista

const joya = (id) => {
  return joyas.find((g) => g.id == id);
};

app.get("/joyav2/:id", (req, res) => {
  const { id } = req.params;
  const { fields } = req.query;
  if (fields) return res.send({
    joya: fieldsSelect(joya(id),
      fields.split(","))
  });
  joya(id)
    ? res.send({
      joyas: joya(id),
    })
    :
    res.status(404).send({
      error: "404 Not Found",
      message: "El id seleccionado no pertenece a ninguna joya",
    });
});


// Permitir hacer paginación de las joyas usando Query Strings.

app.get("/api/v2/joyaspag", (req, res) => {
  const { values } = req.query;
  if (values == "asc") return res.send(orderValues("asc"));
  if (values == "desc") return res.send(orderValues("desc"));

  if (req.query.page) {
    const { page, limits } = req.query;
    return res.send({
      joyas: HATEOASV2().slice(page * 3 - 3, page *
        3)
    });
  }
  res.send({
    joyas: HATEOASV2(),
  });
});


// Permitir hacer ordenamiento de las joyas según su valor de forma ascendente o
// descendente usando Query Strings.

const orderValues = (order) => {
  return order == "asc"
    ? joyas.sort((a, b) => (a.value > b.value ? 1 : -1))
    : order == "desc"
      ? joyas.sort((a, b) => (a.value < b.value ? 1 : -1))
      : false;
};

// la ruta a consultar debe ser /api/v2/joyas?values=asc & /api/v2/joyas?values=desc
app.get("/api/v2/joyas", (req, res) => {
  const { values } = req.query;
  if (values == "asc") return res.send(orderValues("asc"));
  if (values == "desc") return res.send(orderValues("desc"));
  res.send({
    joyas: HATEOASV2(),
  });
});
