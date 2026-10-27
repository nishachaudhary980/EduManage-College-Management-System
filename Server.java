import com.sun.net.httpserver.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.NetworkInterface;
import java.nio.file.*;
import java.util.Enumeration;

public class Server {
    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);
        
        server.createContext("/", (exchange) -> {
            String path = exchange.getRequestURI().getPath();
            
            // डिफ़ॉल्ट पेज welcome.html सेट कर दिया है
            if (path.equals("/")) path = "/welcome.html";
            
            File file = new File(path.substring(1));
            if (!file.exists()) {
                String msg = "404 Not Found";
                exchange.sendResponseHeaders(404, msg.length());
                exchange.getResponseBody().write(msg.getBytes());
                exchange.getResponseBody().close();
                return;
            }
            String type = "text/html";
            if (path.endsWith(".css")) type = "text/css";
            if (path.endsWith(".js")) type = "application/javascript";
            if (path.endsWith(".png")) type = "image/png";
            if (path.endsWith(".jpg")) type = "image/jpeg";
            
            byte[] data = Files.readAllBytes(file.toPath());
            exchange.getResponseHeaders().set("Content-Type", type);
            exchange.sendResponseHeaders(200, data.length);
            exchange.getResponseBody().write(data);
            exchange.getResponseBody().close();
        });
        
        server.setExecutor(null);
        server.start();
        
        // कंप्यूटर का असली IP पता करने का तरीका
        String ip = "localhost";
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) continue;
                Enumeration<java.net.InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    java.net.InetAddress addr = addresses.nextElement();
                    if (addr instanceof java.net.Inet4Address) {
                        ip = addr.getHostAddress();
                    }
                }
            }
        } catch (Exception e) {}

        System.out.println("========================================");
        System.out.println("  Server chal gaya!");
        System.out.println("  PC URL: http://localhost:8081");
        System.out.println("  Phone URL: http://" + ip + ":8081");
        System.out.println("========================================");
        
        // ब्राउज़र अपने आप खुलेगा (IP के साथ, ताकि QR फोन में काम करे)
        try {
            Runtime.getRuntime().exec("rundll32 url.dll,FileProtocolHandler http://" + ip + ":8081");
        } catch (Exception e) {}
    }
}