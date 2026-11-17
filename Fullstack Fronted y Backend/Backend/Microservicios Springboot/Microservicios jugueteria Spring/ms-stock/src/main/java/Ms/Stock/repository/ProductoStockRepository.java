package Ms.Stock.repository;

import Ms.Stock.model.ProductoStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoStockRepository extends JpaRepository<ProductoStock, Long> {

    @Query("SELECT p FROM ProductoStock p WHERE p.stock <= p.minStock")
    List<ProductoStock> findStockBajo();
}