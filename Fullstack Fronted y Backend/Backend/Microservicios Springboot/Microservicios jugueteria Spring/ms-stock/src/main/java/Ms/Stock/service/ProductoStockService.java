package Ms.Stock.service;

import Ms.Stock.model.ProductoStock;
import Ms.Stock.repository.ProductoStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoStockService {

    private final ProductoStockRepository productoStockRepository;

    public ProductoStock actualizarStock(Long productoId, int stock) {
        ProductoStock producto = productoStockRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setStock(stock);
        return productoStockRepository.save(producto);
    }

    public List<ProductoStock> verificarStockBajo() {
        return productoStockRepository.findStockBajo();
    }
    public ProductoStock crearProducto(String nombre, int stock, int minStock) {
        ProductoStock producto = new ProductoStock();
        producto.setNombre(nombre);
        producto.setStock(stock);
        producto.setMinStock(minStock);
        return productoStockRepository.save(producto);
    }
}