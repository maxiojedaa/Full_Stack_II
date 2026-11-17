package Ms.Stock.service;

import Ms.Stock.model.ProductoStock;
import Ms.Stock.model.Venta;
import Ms.Stock.repository.ProductoStockRepository;
import Ms.Stock.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoStockRepository productoStockRepository;

    @Transactional
    public Venta registrarVenta(Long productoId, int cantidad) {
        ProductoStock producto = productoStockRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente");
        }

        producto.setStock(producto.getStock() - cantidad);
        productoStockRepository.save(producto);

        Venta venta = new Venta();
        venta.setProductoId(productoId);
        venta.setCantidad(cantidad);
        venta.setFecha(LocalDateTime.now());

        return ventaRepository.save(venta);
    }
}