import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";

const FaceRecognition = () => {
  const videoRef = useRef(null); // Tham chiếu đến video
  const canvasRef = useRef(null); // Tham chiếu đến canvas
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải model
  const [storedFaceData, setStoredFaceData] = useState([]); // Lưu trữ dữ liệu khuôn mặt đã nhận diện
  const [isRecognitionInProgress, setIsRecognitionInProgress] = useState(false); // Trạng thái nhận diện
  const [hasDetectedFace, setHasDetectedFace] = useState(false); // Trạng thái có khuôn mặt nào được phát hiện

  // Bắt đầu phát video từ webcam
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            handleVideoPlay(); // Gọi hàm xử lý nhận diện khuôn mặt
          };
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
        alert("Please allow camera access and reload the page.");
      });
  };

  // Tải các mô hình Face API
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL =
        "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights";
      try {
        // Chờ tải tất cả các mô hình cần thiết trước khi bắt đầu video
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        console.log("Models loaded successfully!");
        setIsLoading(false); // Đặt trạng thái tải xong model
        startVideo(); // Bắt đầu video sau khi tải xong model
      } catch (err) {
        console.error("Error loading models:", err);
        alert("Error loading face detection models.");
      }
    };

    loadModels();

    return () => {
      // Dọn dẹp khi component unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []); // Mảng phụ thuộc rỗng đảm bảo useEffect chỉ chạy một lần khi component được mount

  const fetchFaceDescriptorsFromImages = async () => {
    try {
      const imageFiles = ["NV01_Phong.png","NV02_Phuc.png","NV03_Trung.png","NV04_Dat.png"]; // Thêm các tên ảnh khác vào đây
      const descriptors = await Promise.all(
        imageFiles.map(async (imageFile) => {
          const img = await faceapi.fetchImage(`http://localhost:3000/Images/${imageFile}`);
          const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            return {
              imageFile, // Gắn tên file ảnh để dễ dàng xác định
              faceDescriptor: detection.descriptor,
            };
          }
          return null;
        })
      );

      return descriptors.filter((d) => d !== null); // Lọc các kết quả null
    } catch (error) {
      console.error("Error fetching face descriptors from images:", error);
      return [];
    }
  };

  const handleVideoPlay = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
  
    // Nếu video hoặc canvas không tồn tại, hoặc nhận diện đang tiến hành, dừng lại
    if (!video || !canvas || isRecognitionInProgress) return;
  
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);
  
    // Lấy dữ liệu khuôn mặt từ các ảnh trong thư mục Images
    const storedFaceData = await fetchFaceDescriptorsFromImages();
    console.log("Stored face data:", storedFaceData);
  
    // Nhận diện tất cả khuôn mặt trong video
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
  
    console.log("Detected faces:", detections);
  
    if (detections.length > 0) {
      setHasDetectedFace(true); // Cập nhật trạng thái phát hiện khuôn mặt
  
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
      const context = canvas.getContext("2d", { willReadFrequently: true });
      context.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, resizedDetections);
  
      // Kiểm tra nếu có khuôn mặt trùng khớp
      detections.forEach((detection) => {
        const match = storedFaceData.find((data) =>
          faceapi.euclideanDistance(detection.descriptor, data.faceDescriptor) < 0.5
        );
  
        if (match) {
          setIsRecognitionInProgress(true); // Đánh dấu bắt đầu nhận diện
  
          // In ra độ chính xác so sánh để kiểm tra kết quả
          const euclideanDistance = faceapi.euclideanDistance(detection.descriptor, match.faceDescriptor);
          console.log(`Euclidean distance: ${euclideanDistance}`);
  
          alert(`Thành công! Khuôn mặt trùng khớp với ảnh ${match.imageFile}`);
          console.log(`Thành công! Khuôn mặt trùng khớp với ảnh ${match.imageFile}`);
  
          // Lưu trữ thông tin khuôn mặt đã nhận diện
          setStoredFaceData((prevData) => [...prevData, match]);
  
          // Ngừng nhận diện trong 5 giây để tránh nhận diện lại ngay lập tức
          setTimeout(() => {
            setIsRecognitionInProgress(false); // Reset để tiếp tục nhận diện
          }, 5000);
  
          // Sau khi nhận diện xong, ngừng nhận diện thêm
          return; // Dừng lại sau khi nhận diện xong, không tiếp tục xử lý các khuôn mặt còn lại
        }
      });
    } else {
      setHasDetectedFace(false); // Cập nhật trạng thái không phát hiện khuôn mặt
    }
  
    // Nếu không có khuôn mặt nào, tiếp tục tìm kiếm và cập nhật trạng thái nhận diện
    if (!isRecognitionInProgress) {
      // Gọi lại handleVideoPlay để tiếp tục nhận diện nếu không có khuôn mặt nào đã được nhận diện
      requestAnimationFrame(handleVideoPlay);
    } else {
      console.log("Waiting for 5 seconds before detecting again...");
    }
  };
  

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Face Recognition Attendance</h3>

      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading face detection models...</p>
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "720px",
            margin: "0 auto",
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            style={{ width: "100%" }}
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FaceRecognition;
